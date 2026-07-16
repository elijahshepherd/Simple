import { Token, TokenType } from './lexer.js';

export class SimpleError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number,
    public sourceLine: string = '',
    public suggestion?: string
  ) {
    super(message);
    this.name = 'SimpleError';
  }

  static fromToken(token: Token, message: string, suggestion?: string): SimpleError {
    return new SimpleError(message, token.line, token.column, '', suggestion);
  }

  toString(source?: string): string {
    const col = Math.max(0, this.column - 1);
    let result = `Error at line ${this.line}, column ${this.column}: ${this.message}`;
    if (this.suggestion) {
      result += `\nSuggestion: ${this.suggestion}`;
    }
    if (source && this.sourceLine) {
      const pointer = ' '.repeat(col) + '^';
      result += `\n${this.sourceLine}\n${pointer}`;
    } else if (this.sourceLine) {
      const pointer = ' '.repeat(col) + '^';
      result += `\n${this.sourceLine}\n${pointer}`;
    }
    return result;
  }
}

export function formatError(error: SimpleError, source?: string): string {
  const lines = source?.split('\n') || [];
  const sourceLine = lines[error.line - 1] || error.sourceLine;
  const col = Math.max(0, error.column - 1);
  const pointer = ' '.repeat(col) + '^';

  let msg = `I ran into a problem at line ${error.line}, column ${error.column}:\n`;
  msg += `${error.message}\n`;
  if (sourceLine) {
    msg += `${sourceLine}\n${pointer}\n`;
  }
  if (error.suggestion) {
    msg += `Hint: ${error.suggestion}`;
  }
  return msg;
}

export function unexpectedToken(token: Token, expected: string[]): SimpleError {
  const got = token.type === TokenType.EOF ? 'end of file' : `"${token.value}"`;
  return new SimpleError(
    `I expected ${expected.join(' or ')} but got ${got}.`,
    token.line,
    token.column,
    '',
    `Try adding ${expected[0].toLowerCase()} here.`
  );
}

export function undefinedIdentifier(token: Token, name: string): SimpleError {
  return new SimpleError(
    `I couldn't find anything named "${name}".`,
    token.line,
    token.column,
    '',
    `Check spelling or make sure you used "remember ${name} as ..." first.`
  );
}

export function typeMismatch(token: Token, expected: string, got: string): SimpleError {
  return new SimpleError(
    `I expected a ${expected} but got a ${got}.`,
    token.line,
    token.column,
    '',
    `Make sure you're using the right type of value here.`
  );
}

export function wrongArgCount(token: Token, name: string, expected: number, got: number): SimpleError {
  return new SimpleError(
    `Function "${name}" expects ${expected} argument${expected !== 1 ? 's' : ''} but got ${got}.`,
    token.line,
    token.column,
    '',
    `Check the function definition and call it with the right number of values.`
  );
}

export function notCallable(token: Token, name: string): SimpleError {
  return new SimpleError(
    `"${name}" is not a function and cannot be called.`,
    token.line,
    token.column,
    '',
    `Did you mean to use it as a value instead?`
  );
}

export function divisionByZero(token: Token): SimpleError {
  return new SimpleError(
    `Cannot divide by zero.`,
    token.line,
    token.column,
    '',
    `Check that the divisor is not zero before dividing.`
  );
}

export function indexOutOfBounds(token: Token, index: number, length: number): SimpleError {
  return new SimpleError(
    `List index ${index} is out of bounds (list has ${length} items).`,
    token.line,
    token.column,
    '',
    `Valid indices are 0 to ${length - 1}.`
  );
}

export function keyNotFound(token: Token, key: string): SimpleError {
  return new SimpleError(
    `No key "${key}" found in this dictionary.`,
    token.line,
    token.column,
    '',
    `Check the spelling or use "contains" to check first.`
  );
}

export function fileNotFound(token: Token, path: string): SimpleError {
  return new SimpleError(
    `File "${path}" does not exist.`,
    token.line,
    token.column,
    '',
    `Check the path or use "exists" to verify first.`
  );
}

export function ioError(token: Token, operation: string, message: string): SimpleError {
  return new SimpleError(
    `Could not ${operation}: ${message}`,
    token.line,
    token.column,
    '',
    `Check permissions and that the path is valid.`
  );
}