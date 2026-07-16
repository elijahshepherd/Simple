import { Parser } from './dist/parser.js';
import { TokenType } from './dist/lexer.js';

const source = 'attempts is less than maxAttempts';

// Add debug to the parser
const originalMatch = Parser.prototype.match;
Parser.prototype.match = function(...types) {
  console.log('match() called, types:', types.map(t => TokenType[t]), 'current:', this.peek().type);
  const result = originalMatch.call(this, ...types);
  console.log('match() result:', result, 'new current:', this.peek().type);
  return result;
};

const originalAdvance = Parser.prototype.advance;
Parser.prototype.advance = function() {
  console.log('advance() called, current:', this.peek().type, '->', this.peek(1).type);
  return originalAdvance.call(this);
};

const parser = new Parser(source);
try {
  const program = parser.parse();
  console.log('Success:', JSON.stringify(program, null, 2));
} catch (e) {
  console.error('Parse error:', e.message);
}