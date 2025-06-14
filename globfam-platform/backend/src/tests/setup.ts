import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/globfam_test';

beforeAll(async () => {
  // Setup code that runs before all tests
  console.log('🧪 Starting test suite...');
});

afterAll(async () => {
  // Cleanup code that runs after all tests
  console.log('✅ Test suite completed');
});