/**
 * Formula Evaluator Test Script
 * 
 * This script runs the formula evaluator test to verify the functionality
 */

// Import the test function using ES module syntax
import { testFormulaEvaluator } from './src/generated/prisma/lib/formula/test-formula-evaluator.js';

// Run the test
console.log('Starting formula evaluator test...');
testFormulaEvaluator()
  .then(results => {
    console.log('Test completed successfully with results:', results.length);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  }); 