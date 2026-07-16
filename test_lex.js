import { lex } from './dist/lexer.js';
const source = 'say "2 + 3 = " (2 plus 3)';
const tokens = lex(source);
tokens.forEach(t => console.log(t.type, t.value));