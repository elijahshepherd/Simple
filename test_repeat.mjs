import { Parser } from './dist/parser.js';

const source = 'repeat while attempts is less than maxAttempts\n  say "hi"\nend';
const parser = new Parser(source);
const program = parser.parse();
console.log('Statements:', program.statements.length);
program.statements.forEach((s, i) => console.log(i, s.type, JSON.stringify(s).substring(0, 200)));