import { Parser } from './dist/parser.js';
import { Interpreter } from './dist/interpreter.js';

const source = `
function calculate(a, op, b)
  if op is "+"
    return a plus b
  end
end

say "10 + 5 = " call calculate with 10, "+", 5
`;

const parser = new Parser(source);
const program = parser.parse();
console.log('Statements:', program.statements.length);

const interpreter = new Interpreter();

// Patch callUserFunction to debug
const originalCallUserFunction = interpreter.callUserFunction.bind(interpreter);
interpreter.callUserFunction = async function(name, args) {
  console.log('>>> callUserFunction:', name, 'args:', args);
  const func = this.functions.get(name);
  console.log('    func:', func);
  return originalCallUserFunction(name, args);
};

await interpreter.interpret(program);