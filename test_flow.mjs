import { Parser } from './dist/parser.js';
import { Interpreter, Environment } from './dist/interpreter.js';

const source = `
function calculate(a, op, b)
  return a plus b
end

say "10 + 5 = " call calculate with 10, "+", 5
`;

const parser = new Parser(source);
const program = parser.parse();
console.log('Statements:', program.statements.length);
program.statements.forEach((s, i) => console.log(i, s.type));

const interpreter = new Interpreter();


const originalCallUserFunction = interpreter.callUserFunction.bind(interpreter);
interpreter.callUserFunction = async function(name, args) {
  console.log('>>> callUserFunction:', name, 'args:', args);
  const result = await originalCallUserFunction(name, args);
  console.log('<<< callUserFunction result:', result);
  return result;
};


const originalExecuteSay = interpreter.executeSay.bind(interpreter);
interpreter.executeSay = async function(stmt) {
  console.log('>>> executeSay start');
  const result = await originalExecuteSay(stmt);
  console.log('<<< executeSay end');
  return result;
};


const originalEvaluate = interpreter.evaluate.bind(interpreter);
interpreter.evaluate = async function(expr) {
  console.log('>>> evaluate:', expr.type);
  const result = await originalEvaluate(expr);
  console.log('<<< evaluate end:', expr.type, 'result:', result);
  return result;
};

try {
  await interpreter.interpret(program);
  console.log('Interpret completed');
} catch (e) {
  console.error('Error:', e.message);
}