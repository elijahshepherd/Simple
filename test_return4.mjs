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

const interpreter = new Interpreter();


const originalCallUserFunction = interpreter.callUserFunction.bind(interpreter);
interpreter.callUserFunction = async function(name, args) {
  console.log('>>> callUserFunction start', name);
  try {
    const result = await originalCallUserFunction(name, args);
    console.log('>>> callUserFunction end, result:', result);
    return result;
  } catch (e) {
    console.log('>>> callUserFunction caught:', e.constructor.name, e instanceof ReturnValue, e.value);
    throw e;
  }
};


const originalExecuteReturn = interpreter.executeReturn.bind(interpreter);
interpreter.executeReturn = async function(stmt) {
  console.log('>>> executeReturn start');
  return originalExecuteReturn(stmt);
};

try {
  await interpreter.interpret(program);
  console.log('Interpret completed normally');
} catch (e) {
  console.log('Top-level catch:', e.constructor.name, e.message);
}