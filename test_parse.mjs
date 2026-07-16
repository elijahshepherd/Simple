import { Parser } from './dist/parser.js';

const source = `numbers.push 6
remember x as numbers.pop`;
const parser = new Parser(source);
const program = parser.parse();
console.log(JSON.stringify(program, null, 2));