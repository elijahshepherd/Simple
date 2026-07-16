import { Parser } from './dist/parser.js';
import { Interpreter, Environment } from './dist/interpreter.js';

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

// Patch callUserFunction to debug environment
const originalCallUserFunction = interpreter.callUserFunction.bind(interpreter);
interpreter.callUserFunction = async function(name, args) {
  console.log('>>> callUserFunction:', name, 'args:', args);
  const func = this.functions.get(name);
  console.log('    func.params:', func.params);
  
  const previousEnv = this.environment;
  this.environment = new Environment();
  this.environment.parent = previousEnv;

  for (let i = 0; i < func.params.length; i++) {
    this.environment.define(func.params[i], args[i]);
    console.log('    defined param:', func.params[i], '=', args[i]);
  }
  console.log('    env has a:', this.environment.has('a'));
  console.log('    env has op:', this.environment.has('op'));
  console.log('    env has b:', this.environment.has('b'));
  
  try {
    await this.executeBlock(func.body);
  } catch (e) {
    if (e.constructor.name === 'ReturnValue') {
      console.log('    caught ReturnValue:', e.value);
      return e.value;
    }
    throw e;
  } finally {
    this.environment = previousEnv;
  }
  return null;
};

try {
  await interpreter.interpret(program);
  console.log('Done');
} catch (e) {
  console.error('Error:', e.message);
}