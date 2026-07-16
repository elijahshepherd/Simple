import { Parser } from './dist/parser.js';

const source = 'attempts is less than maxAttempts';
const parser = new Parser(source);
const program = parser.parse();
console.log('Program:', JSON.stringify(program, null, 2));