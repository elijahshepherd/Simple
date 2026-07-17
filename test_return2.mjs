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


const originalExecuteReturn = Interpreter.prototype.executeReturn;
Interpreter.prototype.executeReturn = async function(stmt) {
  console.log('>>> executeReturn called');
  return originalExecuteReturn.call(this, stmt);
};


const originalCallUserFunction = Interpreter.prototype.callUserFunction;
Interpreter.prototype.callUserFunction = async function(name, args) {
  console.log('>>> callUserFunction called for', name);
  try {
    const result = await originalCallUserFunction.call(this, name, args);
    console.log('<<< callUserFunction returning', result);
    return result;
  } catch (e) {
    console.log('<<< callUserFunction caught', e.constructor.name);
    throw e;
  }
};

const interpreter = new Interpreter();
try {
  await interpreter.interpret(program);
  console.log('Done - interpret completed normally');
} catch (e) {
  console.log('Caught at top level:', e.constructor.name, e.message);
}