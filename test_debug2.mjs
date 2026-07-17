import { Parser } from './dist/parser.js';

const source = 'attempts is less than maxAttempts';


const originalExpression = Parser.prototype.expression;
Parser.prototype.expression = function() {
  console.log('expression() called, current:', this.peek().type, this.peek().value);
  return originalExpression.call(this);
};

const originalEquality = Parser.prototype.equality;
Parser.prototype.equality = function() {
  console.log('equality() called, current:', this.peek().type, this.peek().value);
  return originalEquality.call(this);
};

const originalComparison = Parser.prototype.comparison;
Parser.prototype.comparison = function() {
  console.log('comparison() called, current:', this.peek().type, this.peek().value);
  return originalComparison.call(this);
};

const originalTerm = Parser.prototype.term;
Parser.prototype.term = function() {
  console.log('term() called, current:', this.peek().type, this.peek().value);
  return originalTerm.call(this);
};

const originalFactor = Parser.prototype.factor;
Parser.prototype.factor = function() {
  console.log('factor() called, current:', this.peek().type, this.peek().value);
  return originalFactor.call(this);
};

const originalUnary = Parser.prototype.unary;
Parser.prototype.unary = function() {
  console.log('unary() called, current:', this.peek().type, this.peek().value);
  return originalUnary.call(this);
};

const originalCall = Parser.prototype.call;
Parser.prototype.call = function() {
  console.log('call() called, current:', this.peek().type, this.peek().value);
  return originalCall.call(this);
};

const originalPrimary = Parser.prototype.primary;
Parser.prototype.primary = function() {
  console.log('primary() called, current:', this.peek().type, this.peek().value);
  return originalPrimary.call(this);
};

const parser = new Parser(source);
try {
  const program = parser.parse();
  console.log('Success:', JSON.stringify(program, null, 2));
} catch (e) {
  console.error('Parse error:', e.message);
}