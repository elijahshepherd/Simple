const { Parser } = require('./dist/parser.js');
const { Interpreter } = require('./dist/interpreter.js');

const source = 'say "17 % 5 = " (17 mod 5)';
const parser = new Parser(source);
const program = parser.parse();
console.log('Statements:', program.statements.length);
program.statements.forEach((s, i) => console.log(i, s.type));

const interpreter = new Interpreter();
interpreter.interpret(program).then(() => console.log('Done')).catch(e => console.error('Error:', e.message));