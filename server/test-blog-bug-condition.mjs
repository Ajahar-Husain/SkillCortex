/**
 * Bug Condition Exploration Test for Blog Comprehensive Content
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * Property 1: Bug Condition - Minimal Blog Content Detection
 * 
 * This test encodes the expected behavior:
 * - Content word count should be between 1500-2500 words
 * - Content should contain multiple code examples
 * - Content should contain detailed explanations organized into sections
 * - Content should contain best practices
 * - Content should contain multiple reference links (3-5 minimum)
 * - Content should match readMin expectations
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper functions for content analysis
function wordCount(content) {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function containsMultipleCodeExamples(content) {
  // Look for code indicators: code blocks, code-related terms with examples
  const codePatterns = [
    /```[\s\S]*?```/g, // Markdown code blocks
    /`[^`]+`/g, // Inline code
    /function\s+\w+\s*\(/g, // Function declarations
    /const\s+\w+\s*=/g, // Const declarations
    /class\s+\w+/g, // Class declarations
    /import\s+.*from/g, // Import statements
  ];
  
  let codeExampleCount = 0;
  for (const pattern of codePatterns) {
    const matches = content.match(pattern);
    if (matches) {
      codeExampleCount += matches.length;
    }
  }
  
  // Expecting at least 3 code examples/patterns
  return codeExampleCount >= 3;
}

function containsDetailedExplanations(content) {
  // Check for section-like structure and detailed explanations
  // Look for multiple paragraphs, headings, or substantial content blocks
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  const hasMultipleParagraphs = paragraphs.length >= 5;
  
  // Look for explanatory markers
  const explanatoryMarkers = [
    /how to/i,
    /learn/i,
    /understand/i,
    /implement/i,
    /explore/i,
    /master/i,
    /covers/i,
    /includes?/i,
    /provides?/i,
    /explains?/i,
  ];
  
  let explanationIndicators = 0;
  for (const marker of explanatoryMarkers) {
    if (marker.test(content)) {
      explanationIndicators++;
    }
  }
  
  return hasMultipleParagraphs && explanationIndicators >= 3;
}

function containsBestPractices(content) {
  // Look for best practice indicators
  const bestPracticeMarkers = [
    /best practice/i,
    /pattern/i,
    /optimization/i,
    /performance/i,
    /security/i,
    /common pitfall/i,
    /avoid/i,
    /recommended/i,
    /industry standard/i,
    /guideline/i,
  ];
  
  let markerCount = 0;
  for (const marker of bestPracticeMarkers) {
    if (marker.test(content)) {
      markerCount++;
    }
  }
  
  // Expecting at least 2 best practice indicators
  return markerCount >= 2;
}

function containsMultipleReferences(content) {
  // Look for URLs (reference links)
  const urlPattern = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlPattern);
  
  // Expecting 3-5 reference links minimum
  return urls && urls.length >= 3;
}

function contentMatchesReadMin(content, readMin) {
  // Average reading speed: 200-250 words per minute
  const words = wordCount(content);
  const expectedMinWords = readMin * 200; // Conservative estimate
  const expectedMaxWords = readMin * 250; // Generous estimate
  
  // Allow some flexibility: content should be at least 50% of expected minimum
  return words >= (expectedMinWords * 0.5);
}

function isBugCondition(blogData) {
  const wc = wordCount(blogData.content);
  return blogData.content !== null &&
         wc < 500 &&
         blogData.readMin >= 8 &&
         !containsDetailedExplanations(blogData.content) &&
         !containsMultipleCodeExamples(blogData.content);
}

// Load blog seeding data from platform.js
async function loadBlogSeedingData() {
  const platformPath = join(__dirname, 'routes', 'platform.js');
  const fileContent = await readFile(platformPath, 'utf-8');
  
  // Extract the blog seeding array from the file
  // This is a simplified approach - we're looking for the insertMany call
  const blogArrayMatch = fileContent.match(/blogs = await Blog\.insertMany\(\[([\s\S]*?)\]\);/);
  
  if (!blogArrayMatch) {
    throw new Error('Could not find blog seeding data in platform.js');
  }
  
  // Parse the blog data (this is a simplified approach)
  // For a more robust solution, we would dynamically evaluate the array
  // For now, we'll parse specific known blog slugs mentioned in the design
  const knownBuggyBlogSlugs = [
    'react-hooks-guide',
    'nodejs-best-practices',
    'database-indexing',
    'typescript-generics',
    'css-grid-mastery',
    'vue-composition-api',
    'nextjs-app-router',
    'web-performance',
    'pwa-offline-first',
    'graphql-apollo-client',
  ];
  
  const blogs = [];
  
  // Extract blog objects
  const blogObjectPattern = /\{\s*slug:\s*'([^']+)'[\s\S]*?content:\s*'([\s\S]*?)'\s*\}/g;
  let match;
  
  while ((match = blogObjectPattern.exec(fileContent)) !== null) {
    const slug = match[1];
    const contentMatch = match[2];
    
    if (knownBuggyBlogSlugs.includes(slug)) {
      // Extract full blog data for this slug
      const blogMatch = fileContent.match(
        new RegExp(`\\{\\s*slug:\\s*'${slug}'[^}]*?readMin:\\s*(\\d+)[^}]*?content:\\s*'([\\s\\S]*?)'\\s*\\}`, 'm')
      );
      
      if (blogMatch) {
        const readMin = parseInt(blogMatch[1]);
        const content = blogMatch[2]
          .replace(/\\n/g, '\n')
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"');
        
        blogs.push({
          slug,
          readMin,
          content,
        });
      }
    }
  }
  
  return blogs;
}

// Main test function
async function runBugConditionExplorationTest() {
  console.log('\n=== Bug Condition Exploration Test ===');
  console.log('Property 1: Minimal Blog Content Detection\n');
  console.log('CRITICAL: This test is EXPECTED TO FAIL on unfixed code');
  console.log('Failure confirms the bug exists\n');
  
  const blogs = await loadBlogSeedingData();
  console.log(`Loaded ${blogs.length} blog articles for testing\n`);
  
  const failures = [];
  const counterexamples = [];
  
  for (const blog of blogs) {
    console.log(`Testing blog: ${blog.slug}`);
    console.log(`  Read time: ${blog.readMin} minutes`);
    
    const wc = wordCount(blog.content);
    console.log(`  Actual word count: ${wc}`);
    
    // Check if this blog meets the bug condition
    if (isBugCondition(blog)) {
      console.log(`  ⚠️  Bug condition detected (word count < 500, readMin >= 8)`);
      
      // Now verify the expected behavior
      const expectedMinWords = 1500;
      const expectedMaxWords = 2500;
      
      const checks = {
        wordCount: wc >= expectedMinWords && wc <= expectedMaxWords,
        multipleCodeExamples: containsMultipleCodeExamples(blog.content),
        detailedExplanations: containsDetailedExplanations(blog.content),
        bestPractices: containsBestPractices(blog.content),
        multipleReferences: containsMultipleReferences(blog.content),
        matchesReadMin: contentMatchesReadMin(blog.content, blog.readMin),
      };
      
      console.log(`  Checks:`);
      console.log(`    - Word count (1500-2500): ${checks.wordCount ? '✓' : '✗'} (actual: ${wc})`);
      console.log(`    - Multiple code examples: ${checks.multipleCodeExamples ? '✓' : '✗'}`);
      console.log(`    - Detailed explanations: ${checks.detailedExplanations ? '✓' : '✗'}`);
      console.log(`    - Best practices: ${checks.bestPractices ? '✓' : '✗'}`);
      console.log(`    - Multiple references (3-5): ${checks.multipleReferences ? '✗' : '✗'}`);
      console.log(`    - Content matches readMin: ${checks.matchesReadMin ? '✓' : '✗'}`);
      
      const allChecksPassed = Object.values(checks).every(v => v === true);
      
      if (!allChecksPassed) {
        const failureDetails = {
          slug: blog.slug,
          readMin: blog.readMin,
          actualWordCount: wc,
          expectedWordCount: `${expectedMinWords}-${expectedMaxWords}`,
          failedChecks: Object.entries(checks)
            .filter(([_, passed]) => !passed)
            .map(([check, _]) => check),
        };
        
        failures.push(failureDetails);
        counterexamples.push(
          `"${blog.slug}" has only ${wc} words instead of ${expectedMinWords}-${expectedMaxWords} words. ` +
          `Failed checks: ${failureDetails.failedChecks.join(', ')}`
        );
      }
      
      console.log(`  Result: ${allChecksPassed ? '✓ PASS' : '✗ FAIL'}\n`);
    } else {
      console.log(`  ℹ️  Not in bug condition scope (sufficient content or low readMin)\n`);
    }
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total blogs tested: ${blogs.length}`);
  console.log(`Blogs with bug condition: ${failures.length}`);
  console.log(`Failures (expected on unfixed code): ${failures.length}`);
  
  if (failures.length > 0) {
    console.log('\n=== Counterexamples Found ===');
    console.log('These demonstrate the bug exists:\n');
    
    counterexamples.forEach((example, index) => {
      console.log(`${index + 1}. ${example}`);
    });
    
    console.log('\n=== Detailed Failure Analysis ===\n');
    failures.forEach(failure => {
      console.log(`Blog: ${failure.slug}`);
      console.log(`  Expected: ${failure.expectedWordCount} words`);
      console.log(`  Actual: ${failure.actualWordCount} words`);
      console.log(`  Read time: ${failure.readMin} minutes`);
      console.log(`  Failed checks: ${failure.failedChecks.join(', ')}`);
      console.log('');
    });
    
    console.log('\n❌ TEST FAILED (This is EXPECTED - confirms bug exists)');
    console.log('\nNext steps:');
    console.log('1. Document these counterexamples');
    console.log('2. Proceed to implement the fix in server/routes/platform.js');
    console.log('3. Re-run this test after the fix (it should PASS)');
    
    process.exit(1); // Exit with failure code
  } else {
    console.log('\n✅ TEST PASSED');
    console.log('All blog articles have comprehensive content.');
    console.log('\nThis means either:');
    console.log('1. The bug has been fixed, OR');
    console.log('2. The test needs adjustment');
    
    process.exit(0);
  }
}

// Run the test
runBugConditionExplorationTest().catch(error => {
  console.error('\n❌ Test execution error:', error);
  process.exit(1);
});
