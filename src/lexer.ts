export enum TokenType {
  // Literals
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  IDENTIFIER = 'IDENTIFIER',

  // Keywords - Core
  SAY = 'SAY',
  ASK = 'ASK',
  REMEMBER = 'REMEMBER',
  CONSTANT = 'CONSTANT',
  IF = 'IF',
  OTHERWISE = 'OTHERWISE',
  END = 'END',
  REPEAT = 'REPEAT',
  TIMES = 'TIMES',
  WHILE = 'WHILE',
  FUNCTION = 'FUNCTION',
  RETURN = 'RETURN',
  CALL = 'CALL',
  WITH = 'WITH',
  IMPORT = 'IMPORT',
  AS = 'AS',
  WAIT = 'WAIT',
  SECONDS = 'SECONDS',
  CLEAR = 'CLEAR',
  EXIT = 'EXIT',

  // Keywords - Files
  CREATE = 'CREATE',
  DELETE = 'DELETE',
  WRITE = 'WRITE',
  APPEND = 'APPEND',
  READ = 'READ',
  INTO = 'INTO',
  FILE = 'FILE',
  FOLDER = 'FOLDER',
  MAKE = 'MAKE',
  LIST = 'LIST',
  COPY = 'COPY',
  MOVE = 'MOVE',
  RENAME = 'RENAME',
  EXISTS = 'EXISTS',
  PATH = 'PATH',

  // Keywords - System
  ARGS = 'ARGS',
  ENV = 'ENV',
  GET = 'GET',
  SET = 'SET',
  RUN = 'RUN',
  PLATFORM = 'PLATFORM',
  ARCH = 'ARCH',

  // Keywords - Random
  INT = 'INT',
  FLOAT = 'FLOAT',
  CHOICE = 'CHOICE',
  SHUFFLE = 'SHUFFLE',
  BOOL = 'BOOL',

  // Keywords - Time
  NOW = 'NOW',
  SLEEP = 'SLEEP',
  FORMAT = 'FORMAT',
  PARSE = 'PARSE',
  YEAR = 'YEAR',
  MONTH = 'MONTH',
  DAY = 'DAY',
  HOUR = 'HOUR',
  MINUTE = 'MINUTE',
  SECOND = 'SECOND',
  TIMESTAMP = 'TIMESTAMP',

  // Keywords - Text
  TEXT = 'TEXT',
  UPPER = 'UPPER',
  LOWER = 'LOWER',
  TRIM = 'TRIM',
  SPLIT = 'SPLIT',
  JOIN = 'JOIN',
  REPLACE = 'REPLACE',
  LENGTH = 'LENGTH',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  SUBSTRING = 'SUBSTRING',
  BY = 'BY',

  // Keywords - Math
  MATH = 'MATH',
  ABS = 'ABS',
  ROUND = 'ROUND',
  FLOOR = 'FLOOR',
  CEIL = 'CEIL',
  SQRT = 'SQRT',
  POW = 'POW',
  MIN = 'MIN',
  MAX = 'MAX',
  CLAMP = 'CLAMP',
  RANDOM = 'RANDOM',
  PI = 'PI',
  E = 'E',

  // Keywords - Colors/Format
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  CYAN = 'CYAN',
  MAGENTA = 'MAGENTA',
  WHITE = 'WHITE',
  BLACK = 'BLACK',
  BRIGHT = 'BRIGHT',
  BOLD = 'BOLD',
  ITALIC = 'ITALIC',
  UNDERLINE = 'UNDERLINE',
  RESET = 'RESET',
  BG_RED = 'BG_RED',
  BG_GREEN = 'BG_GREEN',
  BG_BLUE = 'BG_BLUE',
  BG_YELLOW = 'BG_YELLOW',
  BG_CYAN = 'BG_CYAN',
  BG_MAGENTA = 'BG_MAGENTA',
  BG_WHITE = 'BG_WHITE',
  BG_BLACK = 'BG_BLACK',

  // Operators - Comparison
  IS = 'IS',
  IS_NOT = 'IS_NOT',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS_EQUAL = 'LESS_EQUAL',

  // Operators - Math
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDED_BY = 'DIVIDED_BY',
  MOD = 'MOD',

  // Operators - Logic
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',

  // Additional keywords
  TO = 'TO',
  FROM = 'FROM',
  DIR = 'DIR',
  NAME = 'NAME',
  EXT = 'EXT',
  NUM = 'NUM',

  // Punctuation
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  COMMA = 'COMMA',
  COLON = 'COLON',
  DOT = 'DOT',
  ARROW = 'ARROW',

  // Special
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
  COMMENT = 'COMMENT',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS: Record<string, TokenType> = {
  'say': TokenType.SAY,
  'ask': TokenType.ASK,
  'remember': TokenType.REMEMBER,
  'constant': TokenType.CONSTANT,
  'if': TokenType.IF,
  'otherwise': TokenType.OTHERWISE,
  'end': TokenType.END,
  'repeat': TokenType.REPEAT,
  'times': TokenType.TIMES,
  'while': TokenType.WHILE,
  'function': TokenType.FUNCTION,
  'return': TokenType.RETURN,
  'call': TokenType.CALL,
  'with': TokenType.WITH,
  'import': TokenType.IMPORT,
  'as': TokenType.AS,
  'wait': TokenType.WAIT,
  'seconds': TokenType.SECONDS,
  'clear': TokenType.CLEAR,
  'exit': TokenType.EXIT,
  'create': TokenType.CREATE,
  'delete': TokenType.DELETE,
  'write': TokenType.WRITE,
  'append': TokenType.APPEND,
  'read': TokenType.READ,
  'into': TokenType.INTO,
  'file': TokenType.FILE,
  'folder': TokenType.FOLDER,
  'make': TokenType.MAKE,
  'list': TokenType.LIST,
  'copy': TokenType.COPY,
  'move': TokenType.MOVE,
  'rename': TokenType.RENAME,
  'exists': TokenType.EXISTS,
  'path': TokenType.PATH,
  'path name': TokenType.NAME,
  'red': TokenType.RED,
  'green': TokenType.GREEN,
  'blue': TokenType.BLUE,
  'yellow': TokenType.YELLOW,
  'cyan': TokenType.CYAN,
  'magenta': TokenType.MAGENTA,
  'white': TokenType.WHITE,
  'black': TokenType.BLACK,
  'bright': TokenType.BRIGHT,
  'bold': TokenType.BOLD,
  'italic': TokenType.ITALIC,
  'underline': TokenType.UNDERLINE,
  'reset': TokenType.RESET,
  'bg_red': TokenType.BG_RED,
  'bg_green': TokenType.BG_GREEN,
  'bg_blue': TokenType.BG_BLUE,
  'bg_yellow': TokenType.BG_YELLOW,
  'bg_cyan': TokenType.BG_CYAN,
  'bg_magenta': TokenType.BG_MAGENTA,
  'bg_white': TokenType.BG_WHITE,
  'bg_black': TokenType.BG_BLACK,
  'is': TokenType.IS,
  'not': TokenType.NOT,
  'greater': TokenType.GREATER_THAN,
  'less': TokenType.LESS_THAN,
  'greater than': TokenType.GREATER_THAN,
  'less than': TokenType.LESS_THAN,
  'greater than or equal': TokenType.GREATER_EQUAL,
  'less than or equal': TokenType.LESS_EQUAL,
  'greater or equal': TokenType.GREATER_EQUAL,
  'less or equal': TokenType.LESS_EQUAL,
  'than': TokenType.LESS_THAN,
  'equal': TokenType.IS,
  'to': TokenType.TO,
  'plus': TokenType.PLUS,
  'minus': TokenType.MINUS,
  'multiply': TokenType.MULTIPLY,
  'divided': TokenType.DIVIDED_BY,
  'by': TokenType.BY,
  'mod': TokenType.MOD,
  'and': TokenType.AND,
  'or': TokenType.OR,
  'true': TokenType.BOOLEAN,
  'false': TokenType.BOOLEAN,
  'from': TokenType.FROM,
  'get': TokenType.GET,
  'set': TokenType.SET,
  'join': TokenType.JOIN,
  'dir': TokenType.DIR,
  'ext': TokenType.EXT,
  'upper': TokenType.UPPER,
  'lower': TokenType.LOWER,
  'trim': TokenType.TRIM,
  'split': TokenType.SPLIT,
  'replace': TokenType.REPLACE,
  'length': TokenType.LENGTH,
  'contains': TokenType.CONTAINS,
  'starts with': TokenType.STARTS_WITH,
  'ends with': TokenType.ENDS_WITH,
  'substring': TokenType.SUBSTRING,
  'abs': TokenType.ABS,
  'round': TokenType.ROUND,
  'floor': TokenType.FLOOR,
  'ceil': TokenType.CEIL,
  'sqrt': TokenType.SQRT,
  'pow': TokenType.POW,
  'min': TokenType.MIN,
  'max': TokenType.MAX,
  'clamp': TokenType.CLAMP,
  'random': TokenType.RANDOM,
  'pi': TokenType.PI,
  'e': TokenType.E,
  'int': TokenType.INT,
  'float': TokenType.FLOAT,
  'choice': TokenType.CHOICE,
  'shuffle': TokenType.SHUFFLE,
  'bool': TokenType.BOOL,
  'now': TokenType.NOW,
  'sleep': TokenType.SLEEP,
  'format': TokenType.FORMAT,
  'parse': TokenType.PARSE,
  'year': TokenType.YEAR,
  'month': TokenType.MONTH,
  'day': TokenType.DAY,
  'hour': TokenType.HOUR,
  'minute': TokenType.MINUTE,
  'second': TokenType.SECOND,
  'timestamp': TokenType.TIMESTAMP,
  'text': TokenType.TEXT,
  'math': TokenType.MATH,
  'num': TokenType.NUM,
  'args': TokenType.ARGS,
  'env': TokenType.ENV,
  'run': TokenType.RUN,
  'platform': TokenType.PLATFORM,
  'arch': TokenType.ARCH,
};

// All multi-word keywords, sorted by length (longest first) for greedy matching
const MULTI_WORD_KEYWORDS = [
  'greater than or equal',
  'less than or equal',
  'is not',
  'greater than',
  'less than',
  'greater or equal',
  'less or equal',
  'divided by',
  'bg red',
  'bg green',
  'bg blue',
  'bg yellow',
  'bg cyan',
  'bg magenta',
  'bg white',
  'bg black',
  'starts with',
  'ends with',
  'path name',
];

export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let line = 1;
  let column = 1;
  let i = 0;

  const peek = (offset = 0) => (i + offset < source.length ? source[i + offset] : '\0');
  const advance = () => {
    const ch = source[i++];
    if (ch === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
    return ch;
  };

  while (i < source.length) {
    const ch = peek();

    // Skip whitespace (but track newlines)
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      advance();
      continue;
    }

    if (ch === '\n') {
      tokens.push({ type: TokenType.NEWLINE, value: '\n', line, column });
      advance();
      continue;
    }

    // Comments
    if (ch === '#') {
      let value = '';
      while (peek() !== '\n' && peek() !== '\0') {
        value += advance();
      }
      tokens.push({ type: TokenType.COMMENT, value, line, column });
      continue;
    }

    // String literals
    if (ch === '"' || ch === "'") {
      const quote = advance();
      let value = '';
      let escaped = false;
      while (i < source.length) {
        const c = advance();
        if (escaped) {
          value += c === 'n' ? '\n' : c === 't' ? '\t' : c === '"' ? '"' : c === "'" ? "'" : c === '\\' ? '\\' : c;
          escaped = false;
        } else if (c === '\\') {
          escaped = true;
        } else if (c === quote) {
          break;
        } else {
          value += c;
        }
      }
      tokens.push({ type: TokenType.STRING, value, line, column });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch)) {
      let value = '';
      let isFloat = false;
      while (/[0-9.]/.test(peek())) {
        if (peek() === '.') {
          if (isFloat) break;
          isFloat = true;
        }
        value += advance();
      }
      tokens.push({ type: TokenType.NUMBER, value, line, column });
      continue;
    }

    // Identifiers and keywords (including multi-word)
    if (/[a-zA-Z_]/.test(ch)) {
      let value = '';
      let startCol = column;
      while (/[a-zA-Z0-9_]/.test(peek())) {
        value += advance();
      }

      // Check for multi-word keywords (greedy - longest match first)
      const checkMultiWord = (base: string) => {
        const savedI = i;
        const savedLine = line;
        const savedCol = column;
        let bestMatch = '';
        let bestMatchEndI = savedI;
        let bestMatchEndLine = savedLine;
        let bestMatchEndCol = savedCol;
        
        for (const kw of MULTI_WORD_KEYWORDS) {
          if (kw.startsWith(base.toLowerCase() + ' ')) {
            // Try to match this keyword using local test variables
            const words = kw.split(' ');
            let match = true;
            let testI = savedI;
            let testLine = savedLine;
            let testCol = savedCol;
            
            // Already matched base, check remaining words
            for (let w = 1; w < words.length; w++) {
              // Skip spaces
              while (testI < source.length && source[testI] === ' ') {
                testCol++;
                testI++;
              }
              if (testI >= source.length) { match = false; break; }
              
              // Check word
              let word = '';
              while (testI < source.length && /[a-zA-Z_]/.test(source[testI])) {
                word += source[testI];
                testI++;
                testCol++;
              }
              if (word.toLowerCase() !== words[w]) {
                match = false;
                break;
              }
            }
            
            if (match && kw.length > bestMatch.length) {
              bestMatch = kw;
              bestMatchEndI = testI;
              bestMatchEndLine = testLine;
              bestMatchEndCol = testCol;
            }
          }
        }
        
        if (bestMatch) {
          i = bestMatchEndI;
          line = bestMatchEndLine;
          column = bestMatchEndCol;
          return bestMatch;
        }
        
        // Restore
        i = savedI;
        line = savedLine;
        column = savedCol;
        return null;
      };

      const multiWord = checkMultiWord(value);
      if (multiWord) {
        const kw = KEYWORDS[multiWord.toLowerCase()];
        if (kw) {
          tokens.push({ type: kw, value: multiWord, line, column: startCol });
          continue;
        }
      }

      const kw = KEYWORDS[value.toLowerCase()];
      if (kw) {
        tokens.push({ type: kw, value, line, column: startCol });
      } else {
        tokens.push({ type: TokenType.IDENTIFIER, value, line, column: startCol });
      }
      continue;
    }

    // Operators and punctuation
    const twoChar = ch + peek(1);
    if (twoChar === '->') {
      advance(); advance();
      tokens.push({ type: TokenType.ARROW, value: '->', line, column });
      continue;
    }

    const singleChar: Record<string, TokenType> = {
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      '[': TokenType.LBRACKET,
      ']': TokenType.RBRACKET,
      '{': TokenType.LBRACE,
      '}': TokenType.RBRACE,
      ',': TokenType.COMMA,
      ':': TokenType.COLON,
      '.': TokenType.DOT,
    };

    if (singleChar[ch]) {
      tokens.push({ type: singleChar[ch], value: ch, line, column });
      advance();
      continue;
    }

    // Unknown character
    advance();
  }

  tokens.push({ type: TokenType.EOF, value: '', line, column });
  return tokens;
}