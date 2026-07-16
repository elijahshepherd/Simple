import { Parser } from './dist/parser.js';
import { Interpreter } from './dist/interpreter.js';

const source = `
function calculate(a, op, b)
  if op is "+"
    return a plus b
  end
  if op is "-"
    return a minus b
  end
  if op is "*"
    return a multiply b
  end
  if op is "/"
    if b is 0
      return "Error: Division by zero"
    end
    return a divided by b
  end
  if op is "%"
    return a mod b
  end
  return "Unknown operator"
end

say "10 + 5 = " call calculate with 10, "+", 5
`;

const parser = new Parser(source);
const program = parser.parse();
console.log('Statements:', program.statements.length);
program.statements.forEach((s, i) => console.log(i, s.type, s.name || '', s.params || ''));

const interpreter = new Interpreter();
await interpreter.interpret(program);