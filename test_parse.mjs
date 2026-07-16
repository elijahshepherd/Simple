import { Parser } from './dist/parser.js';

const source = `remember nums as [3, 1, 4, 1, 5, 9, 2, 6]
nums.remove 2`;
const parser = new Parser(source);
const program = parser.parse();
console.log(JSON.stringify(program.statements[1], null, 2));