import { Parser } from './dist/parser.js';
import { Interpreter } from './dist/interpreter.js';
import { readFileSync } from 'fs';

const source = readFileSync('./examples/hello.spml', 'utf8');
const parser = new Parser(source);
const program = parser.parse();
console.log('Statements:', program.statements.length);


const originalExecute = Interpreter.prototype.execute;
Interpreter.prototype.execute = async function(stmt) {
  console.log('Executing:', stmt.type, JSON.stringify(stmt).substring(0, 100));
  return originalExecute.call(this, stmt);
};

const interpreter = new Interpreter();
console.log('--- Starting interpret ---');
await interpreter.interpret(program);
console.log('Done');