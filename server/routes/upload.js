import express from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const csv = require('csv-parser');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const buffer = req.file.buffer;
        const mimetype = req.file.mimetype;
        const originalname = req.file.originalname.toLowerCase();
        let extractedText = '';

        if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
            console.log("Parsing PDF buffer of size:", buffer.length);
            const data = await pdfParse(buffer);
            console.log("PDF parsed successfully, text length:", data.text.length);
            extractedText = data.text;
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            originalname.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
        } else if (
            mimetype === 'text/plain' ||
            originalname.endsWith('.txt')
        ) {
            extractedText = buffer.toString('utf-8');
        } else if (
            mimetype === 'text/csv' ||
            originalname.endsWith('.csv')
        ) {
            // Parse CSV dynamically
            const results = [];
            const stream = Readable.from(buffer.toString('utf-8'));
            await new Promise((resolve, reject) => {
                stream
                    .pipe(csv())
                    .on('data', (data) => results.push(JSON.stringify(data)))
                    .on('end', resolve)
                    .on('error', reject);
            });
            extractedText = results.join('\n');
        } else {
            return res.status(400).json({ message: 'Unsupported file format. Please upload PDF, DOCX, TXT, or CSV.' });
        }

        res.json({ text: extractedText });
    } catch (error) {
        console.error('Resume Parse Error stack:', error.stack);
        res.status(500).json({ message: 'Error parsing resume', error: error.message });
    }
});

export default router;
