import { Parser } from './dist/parser.js';
import { Interpreter } from './dist/interpreter.js';

const source = `
function calculate(a, b)
  return a plus b
end

say "10 + 5 = " call calculate with 10, 5
`;

const parser = new Parser(source);
const program = parser.parse();

const interpreter = new Interpreter();

// Patch evaluateBinary
const originalEvaluateBinary = interpreter.evaluateBinary.bind(interpreter);
interpreter.evaluateBinary = async function(expr) {
  console.log('>>> evaluateBinary:', expr.operator, 'left:', expr.left.type, 'right:', expr.right.type);
  const result = await originalEvaluateBinary(expr);
  console.log('<<< evaluateBinary result:', result);
  return result;
};

try {
  await interpreter.interpret(program);
  console.log('Interpret completed');
} catch (e) {
  console.error('Error:', e.message);
}