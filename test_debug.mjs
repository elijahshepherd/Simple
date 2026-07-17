import { lex } from './dist/lexer.js';
import { Parser } from './dist/parser.js';

const source = 'attempts is less than maxAttempts';


console.log('=== LEXING ===');
const tokens = lex(source);
tokens.forEach(t => console.log(t.type, t.value));


console.log('\n=== PARSING ===');
const parser = new Parser(source);
try {
  const program = parser.parse();
  console.log('Success:', JSON.stringify(program, null, 2));
} catch (e) {
  console.error('Parse error:', e.message);
}