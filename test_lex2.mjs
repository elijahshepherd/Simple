import { lex } from './dist/lexer.js';

const source = 'attempts is less than maxAttempts';
const tokens = lex(source);
tokens.forEach(t => console.log(t.type, t.value));