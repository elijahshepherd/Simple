import { Parser } from './dist/parser.js';
const source = 'say "2 + 3 = " (2 plus 3)';
const parser = new Parser(source);
const program = parser.parse();
console.log('Statements:', program.statements.length);
program.statements.forEach((s, i) => console.log(i, s.type, JSON.stringify(s).substring(0, 200)));