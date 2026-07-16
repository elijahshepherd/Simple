import { Parser } from './dist/parser.js';
import { Interpreter, ReturnValue } from './dist/interpreter.js';

const source = `
function test()
  return 42
end

say "Result: " call test
`;

const parser = new Parser(source);
const program = parser.parse();
console.log('Statements:', program.statements.length);

const interpreter = new Interpreter();
try {
  await interpreter.interpret(program);
  console.log('Done - no exception');
} catch (e) {
  console.log('Caught exception:', e.constructor.name, e.message);
  if (e instanceof ReturnValue) {
    console.log('It IS a ReturnValue!');
  } else {
    console.log('It is NOT a ReturnValue');
  }
}