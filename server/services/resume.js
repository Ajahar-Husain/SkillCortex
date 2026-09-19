import { Readable } from 'stream';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// pdf-parse v2 exports the PDFParse class (a pdf.js wrapper) — v1's callable
// default export is gone, so calling the module directly throws
// "pdfParse is not a function".
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const csv = require('csv-parser');

// Guardrail: a resume longer than this is almost certainly a parse artifact.
const MAX_TEXT_LENGTH = 100_000;

/**
 * PDF extraction via pdf-parse v2.
 * One parser per call, always destroyed — pdf.js workers must be released.
 */
async function extractPdf(buffer) {
  let parser;
  try {
    parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    return (result?.text || '').trim();
  } catch (e) {
    if (e?.name === 'PasswordException') {
      throw new Error('This PDF is password-protected. Remove the password and try again.');
    }
    if (e?.name === 'InvalidPDFException') {
      throw new Error('This file is not a valid PDF document.');
    }
    throw new Error('Could not read the PDF. It may be corrupted or a scanned/image-only file — paste your details instead.');
  } finally {
    try { await parser?.destroy?.(); } catch { /* worker already gone */ }
  }
}

async function extractDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return (result?.value || '').trim();
  } catch {
    throw new Error('Could not read the DOCX file. Try saving it as PDF or TXT.');
  }
}

function extractTxt(buffer) {
  return buffer.toString('utf8').trim();
}

async function extractCsv(buffer) {
  const rows = [];
  const stream = Readable.from(buffer.toString('utf8'));
  await new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (d) => rows.push(JSON.stringify(d)))
      .on('end', resolve)
      .on('error', reject);
  });
  return rows.join('\n');
}

/** Magic-byte sniffing beats client-reported mimetypes and renamed extensions. */
function detectKind(file) {
  const buf = file.buffer;
  const name = (file.originalname || '').toLowerCase();
  if (buf.subarray(0, 5).toString('latin1') === '%PDF-') return 'pdf';
  // DOCX is a ZIP container; TXT/CSV never start with the PK magic.
  if (buf.subarray(0, 2).toString('latin1') === 'PK') return 'docx';
  if (file.mimetype === 'text/csv' || name.endsWith('.csv')) return 'csv';
  if (file.mimetype === 'text/plain' || name.endsWith('.txt')) return 'txt';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx') || name.endsWith('.doc')) return 'docx';
  return null;
}

/**
 * Extract plain text from an uploaded resume file.
 * Supports PDF, DOCX, TXT and CSV. Throws a user-facing Error message on any
 * failure — routes pass it straight to the client.
 */
export async function extractText(file) {
  if (!file?.buffer?.length) {
    throw new Error('The uploaded file is empty.');
  }
  const kind = detectKind(file);
  let text = '';
  switch (kind) {
    case 'pdf': text = await extractPdf(file.buffer); break;
    case 'docx': text = await extractDocx(file.buffer); break;
    case 'txt': text = extractTxt(file.buffer); break;
    case 'csv': text = await extractCsv(file.buffer); break;
    default:
      throw new Error('Unsupported file format. Please upload a PDF, DOCX, TXT or CSV file.');
  }
  if (!text) {
    throw new Error('No readable text found. The document may be a scanned/image-only file — please paste your details instead.');
  }
  return text.slice(0, MAX_TEXT_LENGTH);
}

