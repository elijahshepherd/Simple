import { Token, TokenType, lex } from './lexer.js';
import { SimpleError, unexpectedToken } from './errors.js';

// AST Node Types
export type Expr =
  | { type: 'Literal'; value: string | number | boolean }
  | { type: 'Identifier'; name: string }
  | { type: 'Binary'; left: Expr; operator: TokenType; right: Expr }
  | { type: 'Unary'; operator: TokenType; operand: Expr }
  | { type: 'Call'; callee: Expr; args: Expr[] }
  | { type: 'Index'; object: Expr; index: Expr }
  | { type: 'Property'; object: Expr; property: string }
  | { type: 'List'; elements: Expr[] }
  | { type: 'Dict'; entries: { key: string; value: Expr }[] };

export type Stmt =
  | { type: 'Say'; expr: Expr; styles: string[] }
  | { type: 'Ask'; prompt: Expr; target: string }
  | { type: 'Remember'; name: string; value: Expr; constant: boolean }
  | { type: 'If'; condition: Expr; thenBranch: Stmt[]; elseBranch: Stmt[] }
  | { type: 'RepeatTimes'; count: Expr; body: Stmt[] }
  | { type: 'RepeatWhile'; condition: Expr; body: Stmt[] }
  | { type: 'Function'; name: string; params: string[]; body: Stmt[] }
  | { type: 'Return'; value?: Expr }
  | { type: 'Call'; name: string; args: Expr[] }
  | { type: 'Import'; module: string; alias?: string }
  | { type: 'Wait'; duration: Expr }
  | { type: 'Clear' }
  | { type: 'Exit'; code?: Expr }
  // File operations
  | { type: 'CreateFile'; path: Expr }
  | { type: 'DeleteFile'; path: Expr }
  | { type: 'WriteFile'; path: Expr; content: Expr; append: boolean }
  | { type: 'ReadFile'; path: Expr; target: string }
  | { type: 'FileExists'; path: Expr; target: string }
  | { type: 'CopyFile'; from: Expr; to: Expr }
  | { type: 'MoveFile'; from: Expr; to: Expr }
  | { type: 'RenameFile'; from: Expr; to: Expr }
  | { type: 'PathJoin'; parts: Expr[]; target: string }
  | { type: 'PathDir'; path: Expr; target: string }
  | { type: 'PathName'; path: Expr; target: string }
  | { type: 'PathExt'; path: Expr; target: string }
  | { type: 'Cwd'; target: string }
  // Folder operations
  | { type: 'CreateFolder'; path: Expr }
  | { type: 'DeleteFolder'; path: Expr }
  | { type: 'ListFolder'; path: Expr; target: string }
  | { type: 'FolderExists'; path: Expr; target: string }
  | { type: 'HomeDir'; target: string }
  | { type: 'TempDir'; target: string }
  // System
  | { type: 'Args'; target: string }
  | { type: 'EnvGet'; key: Expr; target: string }
  | { type: 'EnvSet'; key: Expr; value: Expr }
  | { type: 'RunCommand'; command: Expr; target?: string }
  | { type: 'Platform'; target: string }
  | { type: 'Arch'; target: string }
  // Random
  | { type: 'RandomInt'; min: Expr; max: Expr; target: string }
  | { type: 'RandomFloat'; min: Expr; max: Expr; target: string }
  | { type: 'RandomChoice'; list: Expr; target: string }
  | { type: 'RandomShuffle'; list: Expr; target: string }
  | { type: 'RandomBool'; target: string }
  // Time
  | { type: 'TimeNow'; target: string }
  | { type: 'TimeSleep'; duration: Expr }
  | { type: 'TimeFormat'; timestamp: Expr; format: Expr; target: string }
  | { type: 'TimeParse'; str: Expr; format: Expr; target: string }
  | { type: 'TimeYear'; timestamp: Expr; target: string }
  | { type: 'TimeMonth'; timestamp: Expr; target: string }
  | { type: 'TimeDay'; timestamp: Expr; target: string }
  | { type: 'TimeHour'; timestamp: Expr; target: string }
  | { type: 'TimeMinute'; timestamp: Expr; target: string }
  | { type: 'TimeSecond'; timestamp: Expr; target: string }
  | { type: 'TimeTimestamp'; target: string }
  // Text
  | { type: 'TextUpper'; text: Expr; target: string }
  | { type: 'TextLower'; text: Expr; target: string }
  | { type: 'TextTrim'; text: Expr; target: string }
  | { type: 'TextSplit'; text: Expr; separator: Expr; target: string }
  | { type: 'TextJoin'; list: Expr; separator: Expr; target: string }
  | { type: 'TextReplace'; text: Expr; search: Expr; replace: Expr; target: string }
  | { type: 'TextLength'; text: Expr; target: string }
  | { type: 'TextContains'; text: Expr; search: Expr; target: string }
  | { type: 'TextStartsWith'; text: Expr; prefix: Expr; target: string }
  | { type: 'TextEndsWith'; text: Expr; suffix: Expr; target: string }
  | { type: 'TextSubstring'; text: Expr; start: Expr; end?: Expr; target: string }
  // Math
  | { type: 'MathAbs'; value: Expr; target: string }
  | { type: 'MathRound'; value: Expr; target: string }
  | { type: 'MathFloor'; value: Expr; target: string }
  | { type: 'MathCeil'; value: Expr; target: string }
  | { type: 'MathSqrt'; value: Expr; target: string }
  | { type: 'MathPow'; base: Expr; exp: Expr; target: string }
  | { type: 'MathMin'; a: Expr; b: Expr; target: string }
  | { type: 'MathMax'; a: Expr; b: Expr; target: string }
  | { type: 'MathClamp'; value: Expr; min: Expr; max: Expr; target: string }
  | { type: 'MathRandom'; target: string }
  | { type: 'MathPi'; target: string }
  | { type: 'MathE'; target: string }
  // List operations
  | { type: 'ListPush'; list: Expr; value: Expr }
  | { type: 'ListPop'; list: Expr; target: string }
  | { type: 'ListLength'; list: Expr; target: string }
  | { type: 'ListContains'; list: Expr; value: Expr; target: string }
  | { type: 'ListIndexOf'; list: Expr; value: Expr; target: string }
  | { type: 'ListRemove'; list: Expr; index: Expr }
  | { type: 'ListSlice'; list: Expr; start: Expr; end?: Expr; target: string }
  | { type: 'ListSort'; list: Expr; target: string }
  | { type: 'ListReverse'; list: Expr; target: string };

export interface Program {
  statements: Stmt[];
}

export class Parser {
  private tokens: Token[];
  private current = 0;
  private sourceLines: string[];

  constructor(source: string) {
    this.tokens = lex(source);
    this.sourceLines = source.split('\n');
  }

  parse(): Program {
    const statements: Stmt[] = [];
    while (!this.check(TokenType.EOF)) {
      if (this.check(TokenType.NEWLINE)) {
        this.advance();
        continue;
      }
      if (this.check(TokenType.COMMENT)) {
        this.advance();
        continue;
      }
      statements.push(this.statement());
    }
    return { statements };
  }

  private statement(): Stmt {
    // Import
    if (this.match(TokenType.IMPORT)) return this.importStatement();

    // Say
    if (this.match(TokenType.SAY)) return this.sayStatement();

    // Ask
    if (this.match(TokenType.ASK)) return this.askStatement();

    // Remember / Constant
    if (this.match(TokenType.REMEMBER)) return this.rememberStatement(false);
    if (this.match(TokenType.CONSTANT)) return this.rememberStatement(true);

    // If
    if (this.match(TokenType.IF)) return this.ifStatement();

    // Repeat
    if (this.match(TokenType.REPEAT)) return this.repeatStatement();

    // Function
    if (this.match(TokenType.FUNCTION)) return this.functionStatement();

    // Return
    if (this.match(TokenType.RETURN)) return this.returnStatement();

    // Call
    if (this.match(TokenType.CALL)) return this.callStatement();

    // Wait
    if (this.match(TokenType.WAIT)) return this.waitStatement();

    // Clear
    if (this.match(TokenType.CLEAR)) return { type: 'Clear' };

    // Exit
    if (this.match(TokenType.EXIT)) return this.exitStatement();

    // File operations
    if (this.match(TokenType.CREATE)) {
      if (this.match(TokenType.FILE)) return this.createFileStatement();
      if (this.match(TokenType.FOLDER) || this.match(TokenType.MAKE)) return this.createFolderStatement();
    }

    if (this.match(TokenType.DELETE)) {
      if (this.match(TokenType.FILE)) return this.deleteFileStatement();
      if (this.match(TokenType.FOLDER)) return this.deleteFolderStatement();
    }

    if (this.match(TokenType.WRITE) || this.match(TokenType.APPEND)) {
      const append = this.previous().type === TokenType.APPEND;
      return this.writeFileStatement(append);
    }

    if (this.match(TokenType.READ)) return this.readFileStatement();

    if (this.match(TokenType.COPY) && this.match(TokenType.FILE)) return this.copyFileStatement();
    if (this.match(TokenType.MOVE) && this.match(TokenType.FILE)) return this.moveFileStatement();
    if (this.match(TokenType.RENAME) && this.match(TokenType.FILE)) return this.renameFileStatement();

    if (this.match(TokenType.EXISTS) && this.match(TokenType.FILE)) return this.fileExistsStatement();
    if (this.match(TokenType.PATH)) return this.pathStatement();

    if (this.match(TokenType.LIST) && this.match(TokenType.FOLDER)) return this.listFolderStatement();
    if (this.match(TokenType.EXISTS) && this.match(TokenType.FOLDER)) return this.folderExistsStatement();

    // System
    if (this.match(TokenType.ARGS)) return this.argsStatement();
    if (this.match(TokenType.ENV)) return this.envStatement();
    if (this.match(TokenType.RUN)) return this.runCommandStatement();
    if (this.match(TokenType.PLATFORM)) return this.platformStatement();
    if (this.match(TokenType.ARCH)) return this.archStatement();

    // Random
    if (this.match(TokenType.RANDOM)) return this.randomStatement();

    // Time
    if (this.match(TokenType.NOW)) return this.timeStatement();
    if (this.match(TokenType.SLEEP)) return this.sleepStatement();
    if (this.match(TokenType.FORMAT)) return this.formatStatement();

    // Text
    if (this.match(TokenType.TEXT)) return this.textStatement();

    // Math
    if (this.match(TokenType.MATH)) return this.mathStatement();

    // List operations
    if (this.check(TokenType.IDENTIFIER)) {
      const next = this.peek(1);
      if (next?.type === TokenType.DOT) {
        return this.methodCallStatement();
      }
      // Handle "list.method args" syntax without dot (e.g., "numbers.push 6")
      // The method name can be IDENTIFIER or a keyword like LENGTH, CONTAINS
      if (next && (next.type === TokenType.IDENTIFIER ||
          next.type === TokenType.LENGTH || next.type === TokenType.CONTAINS)) {
        return this.spaceDelimMethodCall();
      }
    }

    // Expression statement (fallback)
    const expr = this.expression();
    this.consumeNewline();
    return { type: 'Expression', expr } as any;
  }

  private importStatement(): Stmt {
    const nameToken = this.consumeName(['module name']);
    let alias: string | undefined;
    if (this.match(TokenType.AS)) {
      const aliasToken = this.consumeName(['alias name']);
      alias = aliasToken.value;
    }
    this.consumeNewline();
    return { type: 'Import', module: nameToken.value.toLowerCase(), alias };
  }

  private sayStatement(): Stmt {
    const styles: string[] = [];

    // Parse color/style modifiers before the expression
    while (true) {
      if (this.match(TokenType.RED)) styles.push('red');
      else if (this.match(TokenType.GREEN)) styles.push('green');
      else if (this.match(TokenType.BLUE)) styles.push('blue');
      else if (this.match(TokenType.YELLOW)) styles.push('yellow');
      else if (this.match(TokenType.CYAN)) styles.push('cyan');
      else if (this.match(TokenType.MAGENTA)) styles.push('magenta');
      else if (this.match(TokenType.WHITE)) styles.push('white');
      else if (this.match(TokenType.BLACK)) styles.push('black');
      else if (this.match(TokenType.BRIGHT)) styles.push('bright');
      else if (this.match(TokenType.BOLD)) styles.push('bold');
      else if (this.match(TokenType.ITALIC)) styles.push('italic');
      else if (this.match(TokenType.UNDERLINE)) styles.push('underline');
      else if (this.match(TokenType.RESET)) styles.push('reset');
      else if (this.match(TokenType.BG_RED)) styles.push('bgRed');
      else if (this.match(TokenType.BG_GREEN)) styles.push('bgGreen');
      else if (this.match(TokenType.BG_BLUE)) styles.push('bgBlue');
      else if (this.match(TokenType.BG_YELLOW)) styles.push('bgYellow');
      else if (this.match(TokenType.BG_CYAN)) styles.push('bgCyan');
      else if (this.match(TokenType.BG_MAGENTA)) styles.push('bgMagenta');
      else if (this.match(TokenType.BG_WHITE)) styles.push('bgWhite');
      else if (this.match(TokenType.BG_BLACK)) styles.push('bgBlack');
      else break;
    }

    // Parse first expression
    let expr = this.expression();

    // Parse additional expressions for implicit concatenation
    // Check if next token could start an expression (for implicit concatenation)
    while (this.isExpressionStart()) {
      const right = this.expression();
      expr = { type: 'Binary', left: expr, operator: TokenType.PLUS, right };
    }

    this.consumeNewline();
    return { type: 'Say', expr, styles };
  }

  // Check if current token can start an expression (for implicit concatenation in say)
  private isExpressionStart(): boolean {
    const token = this.peek();
    return (
      token.type === TokenType.STRING ||
      token.type === TokenType.NUMBER ||
      token.type === TokenType.BOOLEAN ||
      token.type === TokenType.IDENTIFIER ||
      token.type === TokenType.CALL ||
      token.type === TokenType.LPAREN ||
      token.type === TokenType.LBRACKET ||
      token.type === TokenType.LBRACE ||
      token.type === TokenType.MINUS ||
      token.type === TokenType.NOT
    );
  }

  // Check if a property name is a module method that can be called with space-separated args
  private isModuleCallStart(method: string): boolean {
    const moduleMethods = new Set(['int', 'float', 'choice', 'shuffle', 'bool',
      'upper', 'lower', 'trim', 'split', 'join', 'replace', 'length', 'contains',
      'startswith', 'endswith', 'substring',
      'abs', 'round', 'floor', 'ceil', 'sqrt', 'pow', 'min', 'max', 'clamp',
      'random', 'pi', 'e']);
    return moduleMethods.has(method.toLowerCase());
  }

// Parse arguments for a module-style call like "random.int 1 to 100"
// Arguments are separated by "to", "from", "with", "as", "by", "into" or end of line
  private parseModuleCallArgs(): Expr[] {
    const args: Expr[] = [];
    const separators = new Set([
      TokenType.TO, TokenType.FROM, TokenType.WITH, TokenType.AS, TokenType.BY,
      TokenType.INTO, TokenType.NEWLINE, TokenType.EOF, TokenType.OTHERWISE,
      TokenType.END, TokenType.COMMA
    ]);

    while (!this.isAtEnd() && !separators.has(this.peek().type) && this.isExpressionStart()) {
      args.push(this.expression());
      // After an expression, check if we have a separator like "to" that should be consumed
      if (this.isAtEnd()) break;
      if (separators.has(this.peek().type)) {
        // Consume the separator (e.g., "to" in "random.int 1 to 100")
        this.advance();
        // Check if we should continue parsing more arguments
        if (this.isAtEnd() || !this.isExpressionStart()) break;
      } else {
        break;
      }
    }

    return args;
  }

  private askStatement(): Stmt {
    const prompt = this.expression();
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();
    return { type: 'Ask', prompt, target: target.value };
  }

  private rememberStatement(constant: boolean): Stmt {
    const nameToken = this.consumeName(['variable name']);
    this.consume(TokenType.AS, ['"as"']);
    const value = this.expression();
    this.consumeNewline();
    return { type: 'Remember', name: nameToken.value, value, constant };
  }

  private ifStatement(): Stmt {
    const condition = this.expression();
    this.consumeNewline();

    const thenBranch: Stmt[] = [];
    while (!this.check(TokenType.OTHERWISE) && !this.check(TokenType.END) && !this.check(TokenType.EOF)) {
      if (this.check(TokenType.NEWLINE)) { this.advance(); continue; }
      if (this.check(TokenType.COMMENT)) { this.advance(); continue; }
      thenBranch.push(this.statement());
    }

    let elseBranch: Stmt[] = [];
    if (this.match(TokenType.OTHERWISE)) {
      this.consumeNewline();
      while (!this.check(TokenType.END) && !this.check(TokenType.EOF)) {
        if (this.check(TokenType.NEWLINE)) { this.advance(); continue; }
        if (this.check(TokenType.COMMENT)) { this.advance(); continue; }
        elseBranch.push(this.statement());
      }
    }

    this.consume(TokenType.END, ['"end"']);
    this.consumeNewline();
    return { type: 'If', condition, thenBranch, elseBranch };
  }

  private repeatStatement(): Stmt {
    // Check for "repeat N times" or "repeat while condition"
    if (this.check(TokenType.NUMBER) || this.check(TokenType.IDENTIFIER) || this.check(TokenType.LPAREN)) {
      const count = this.expression();
      this.consume(TokenType.TIMES, ['"times"']);
      this.consumeNewline();

      const body: Stmt[] = [];
      while (!this.check(TokenType.END) && !this.check(TokenType.EOF)) {
        if (this.check(TokenType.NEWLINE)) { this.advance(); continue; }
        if (this.check(TokenType.COMMENT)) { this.advance(); continue; }
        body.push(this.statement());
      }
      this.consume(TokenType.END, ['"end"']);
      this.consumeNewline();
      return { type: 'RepeatTimes', count, body };
    }

    if (this.match(TokenType.WHILE)) {
      const condition = this.expression();
      this.consumeNewline();

      const body: Stmt[] = [];
      while (!this.check(TokenType.END) && !this.check(TokenType.EOF)) {
        if (this.check(TokenType.NEWLINE)) { this.advance(); continue; }
        if (this.check(TokenType.COMMENT)) { this.advance(); continue; }
        body.push(this.statement());
      }
      this.consume(TokenType.END, ['"end"']);
      this.consumeNewline();
      return { type: 'RepeatWhile', condition, body };
    }

    throw unexpectedToken(this.peek(), ['number', 'identifier', '"while"']);
  }

  private functionStatement(): Stmt {
    const nameToken = this.consumeName(['function name']);
    const params: string[] = [];
    
    // Support both "function name(params)" and "function name with params"
    if (this.match(TokenType.LPAREN)) {
      // Syntax: function name(param1, param2)
      if (!this.check(TokenType.RPAREN)) {
        do {
          const param = this.consumeName(['parameter name']);
          params.push(param.value);
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RPAREN, ['")"']);
    } else if (this.match(TokenType.WITH)) {
      // Syntax: function name with param1, param2
      do {
        const param = this.consumeName(['parameter name']);
        params.push(param.value);
      } while (this.match(TokenType.COMMA));
    }
    this.consumeNewline();

    const body: Stmt[] = [];
    while (!this.check(TokenType.END) && !this.check(TokenType.EOF)) {
      if (this.check(TokenType.NEWLINE)) { this.advance(); continue; }
      if (this.check(TokenType.COMMENT)) { this.advance(); continue; }
      body.push(this.statement());
    }
    this.consume(TokenType.END, ['"end"']);
    this.consumeNewline();
    return { type: 'Function', name: nameToken.value, params, body };
  }

  private returnStatement(): Stmt {
    let value: Expr | undefined;
    if (!this.check(TokenType.NEWLINE) && !this.check(TokenType.EOF) && !this.check(TokenType.END)) {
      value = this.expression();
      // Parse additional expressions for implicit concatenation (like in say)
      while (this.isExpressionStart()) {
        const right = this.expression();
        value = { type: 'Binary', left: value!, operator: TokenType.PLUS, right };
      }
    }
    this.consumeNewline();
    return { type: 'Return', value };
  }

  private callStatement(): Stmt {
    const nameToken = this.consumeName(['function name']);
    const args: Expr[] = [];
    if (this.match(TokenType.WITH)) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }
    this.consumeNewline();
    return { type: 'Call', name: nameToken.value, args };
  }

  private waitStatement(): Stmt {
    const duration = this.expression();
    this.match(TokenType.SECONDS); // optional "seconds"
    this.consumeNewline();
    return { type: 'Wait', duration };
  }

  private exitStatement(): Stmt {
    let code: Expr | undefined;
    if (!this.check(TokenType.NEWLINE) && !this.check(TokenType.EOF)) {
      code = this.expression();
    }
    this.consumeNewline();
    return { type: 'Exit', code };
  }

  private createFileStatement(): Stmt {
    const path = this.expression();
    this.consumeNewline();
    return { type: 'CreateFile', path };
  }

  private createFolderStatement(): Stmt {
    const path = this.expression();
    this.consumeNewline();
    return { type: 'CreateFolder', path };
  }

  private deleteFileStatement(): Stmt {
    const path = this.expression();
    this.consumeNewline();
    return { type: 'DeleteFile', path };
  }

  private deleteFolderStatement(): Stmt {
    const path = this.expression();
    this.consumeNewline();
    return { type: 'DeleteFolder', path };
  }

  private writeFileStatement(append: boolean): Stmt {
    const content = this.expression();
    this.consume(TokenType.INTO, ['"into"']);
    const path = this.expression();
    this.consumeNewline();
    return { type: 'WriteFile', path, content, append };
  }

  private readFileStatement(): Stmt {
    const path = this.expression();
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();
    return { type: 'ReadFile', path, target: target.value };
  }

  private copyFileStatement(): Stmt {
    const from = this.expression();
    this.consume(TokenType.TO, ['"to"']); // We'll need to add TO token
    const to = this.expression();
    this.consumeNewline();
    return { type: 'CopyFile', from, to };
  }

  private moveFileStatement(): Stmt {
    const from = this.expression();
    this.consume(TokenType.TO, ['"to"']);
    const to = this.expression();
    this.consumeNewline();
    return { type: 'MoveFile', from, to };
  }

  private renameFileStatement(): Stmt {
    const from = this.expression();
    this.consume(TokenType.TO, ['"to"']);
    const to = this.expression();
    this.consumeNewline();
    return { type: 'RenameFile', from, to };
  }

  private fileExistsStatement(): Stmt {
    const path = this.expression();
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();
    return { type: 'FileExists', path, target: target.value };
  }

  private pathStatement(): Stmt {
    if (this.match(TokenType.JOIN)) {
      const parts: Expr[] = [];
      do {
        parts.push(this.expression());
      } while (this.match(TokenType.COMMA));
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'PathJoin', parts, target: target.value };
    }
    if (this.match(TokenType.DIR)) {
      const path = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'PathDir', path, target: target.value };
    }
    if (this.match(TokenType.NAME)) {
      const path = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'PathName', path, target: target.value };
    }
    if (this.match(TokenType.EXT)) {
      const path = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'PathExt', path, target: target.value };
    }
    throw unexpectedToken(this.peek(), ['"join"', '"dir"', '"name"', '"ext"']);
  }

  private listFolderStatement(): Stmt {
    const path = this.expression();
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();
    return { type: 'ListFolder', path, target: target.value };
  }

  private folderExistsStatement(): Stmt {
    const path = this.expression();
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();
    return { type: 'FolderExists', path, target: target.value };
  }

  private argsStatement(): Stmt {
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();
    return { type: 'Args', target: target.value };
  }

  private envStatement(): Stmt {
    if (this.match(TokenType.GET)) {
      const key = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'EnvGet', key, target: target.value };
    }
    if (this.match(TokenType.SET)) {
      const key = this.expression();
      this.consume(TokenType.AS, ['"as"']);
      const value = this.expression();
      this.consumeNewline();
      return { type: 'EnvSet', key, value };
    }
    throw unexpectedToken(this.peek(), ['"get"', '"set"']);
  }

  private runCommandStatement(): Stmt {
    const command = this.expression();
    let target: string | undefined;
    if (this.match(TokenType.INTO)) {
      const targetToken = this.consumeName(['variable name']);
      target = targetToken.value;
    }
    this.consumeNewline();
    return { type: 'RunCommand', command, target };
  }

  private platformStatement(): Stmt {
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();
    return { type: 'Platform', target: target.value };
  }

  private archStatement(): Stmt {
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();
    return { type: 'Arch', target: target.value };
  }

  private randomStatement(): Stmt {
    // Handle optional dot after random (random.int, random.float, etc.)
    this.match(TokenType.DOT);
    
    if (this.match(TokenType.INT)) {
      const min = this.expression();
      this.consume(TokenType.TO, ['"to"']);
      const max = this.expression();
      // Random can be used as expression (no into) or statement (with into)
      if (this.match(TokenType.INTO)) {
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'RandomInt', min, max, target: target.value };
      }
      this.consumeNewline();
      return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.int' }, args: [min, max] } } as any;
    }
    if (this.match(TokenType.FLOAT)) {
      const min = this.expression();
      this.consume(TokenType.TO, ['"to"']);
      const max = this.expression();
      if (this.match(TokenType.INTO)) {
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'RandomFloat', min, max, target: target.value };
      }
      this.consumeNewline();
      return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.float' }, args: [min, max] } } as any;
    }
    if (this.match(TokenType.CHOICE)) {
      this.consume(TokenType.FROM, ['"from"']);
      const list = this.expression();
      if (this.match(TokenType.INTO)) {
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'RandomChoice', list, target: target.value };
      }
      this.consumeNewline();
      return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.choice' }, args: [list] } } as any;
    }
    if (this.match(TokenType.SHUFFLE)) {
      const list = this.expression();
      if (this.match(TokenType.INTO)) {
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'RandomShuffle', list, target: target.value };
      }
      this.consumeNewline();
      return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.shuffle' }, args: [list] } } as any;
    }
    if (this.match(TokenType.BOOL)) {
      if (this.match(TokenType.INTO)) {
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'RandomBool', target: target.value };
      }
      this.consumeNewline();
      return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.bool' }, args: [] } } as any;
    }
    throw unexpectedToken(this.peek(), ['"int"', '"float"', '"choice"', '"shuffle"', '"bool"']);
  }

  private timeStatement(): Stmt {
    if (this.match(TokenType.NOW)) {
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TimeNow', target: target.value };
    }
    throw unexpectedToken(this.peek(), ['"now"']);
  }

  private sleepStatement(): Stmt {
    const duration = this.expression();
    this.consumeNewline();
    return { type: 'TimeSleep', duration };
  }

  private formatStatement(): Stmt {
    const timestamp = this.expression();
    this.consume(TokenType.AS, ['"as"']);
    const format = this.expression();
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();
    return { type: 'TimeFormat', timestamp, format, target: target.value };
  }

  private textStatement(): Stmt {
    if (this.match(TokenType.UPPER)) {
      const text = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextUpper', text, target: target.value };
    }
    if (this.match(TokenType.LOWER)) {
      const text = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextLower', text, target: target.value };
    }
    if (this.match(TokenType.TRIM)) {
      const text = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextTrim', text, target: target.value };
    }
    if (this.match(TokenType.SPLIT)) {
      const text = this.expression();
      this.consume(TokenType.BY, ['"by"']);
      const separator = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextSplit', text, separator, target: target.value };
    }
    if (this.match(TokenType.JOIN)) {
      const list = this.expression();
      this.consume(TokenType.WITH, ['"with"']);
      const separator = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextJoin', list, separator, target: target.value };
    }
    if (this.match(TokenType.REPLACE)) {
      const text = this.expression();
      this.consume(TokenType.WITH, ['"with"']);
      const search = this.expression();
      this.consume(TokenType.AS, ['"as"']);
      const replace = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextReplace', text, search, replace, target: target.value };
    }
    if (this.match(TokenType.LENGTH)) {
      const text = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextLength', text, target: target.value };
    }
    if (this.match(TokenType.CONTAINS)) {
      const text = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextContains', text, search: this.expression(), target: target.value };
    }
    if (this.match(TokenType.STARTS_WITH)) {
      const text = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextStartsWith', text, prefix: this.expression(), target: target.value };
    }
    if (this.match(TokenType.ENDS_WITH)) {
      const text = this.expression();
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextEndsWith', text, suffix: this.expression(), target: target.value };
    }
    if (this.match(TokenType.SUBSTRING)) {
      const text = this.expression();
      this.consume(TokenType.FROM, ['"from"']);
      const start = this.expression();
      let end: Expr | undefined;
      if (this.match(TokenType.TO)) {
        end = this.expression();
      }
      this.consume(TokenType.INTO, ['"into"']);
      const target = this.consumeName(['variable name']);
      this.consumeNewline();
      return { type: 'TextSubstring', text, start, end, target: target.value };
    }
    throw unexpectedToken(this.peek(), ['text operation']);
  }

  private mathStatement(): Stmt {
    const ops: Record<string, { type: Stmt['type']; params: string[] }> = {
      'abs': { type: 'MathAbs', params: ['value'] },
      'round': { type: 'MathRound', params: ['value'] },
      'floor': { type: 'MathFloor', params: ['value'] },
      'ceil': { type: 'MathCeil', params: ['value'] },
      'sqrt': { type: 'MathSqrt', params: ['value'] },
      'pow': { type: 'MathPow', params: ['base', 'exp'] },
      'min': { type: 'MathMin', params: ['a', 'b'] },
      'max': { type: 'MathMax', params: ['a', 'b'] },
      'clamp': { type: 'MathClamp', params: ['value', 'min', 'max'] },
      'random': { type: 'MathRandom', params: [] },
      'pi': { type: 'MathPi', params: [] },
      'e': { type: 'MathE', params: [] },
    };

    const opToken = this.consume(TokenType.IDENTIFIER, ['math operation']);
    const op = ops[opToken.value.toLowerCase()];
    if (!op) throw unexpectedToken(opToken, Object.keys(ops));

    const args: Expr[] = [];
    if (!this.check(TokenType.INTO)) {
      for (const param of op.params) {
        args.push(this.expression());
        if (param !== op.params[op.params.length - 1]) {
          this.consume(TokenType.COMMA, ['","']);
        }
      }
    }
    this.consume(TokenType.INTO, ['"into"']);
    const target = this.consumeName(['variable name']);
    this.consumeNewline();

    const stmt: any = { type: op.type, target: target.value };
    op.params.forEach((param, i) => { stmt[param] = args[i]; });
    return stmt;
  }

  private methodCallStatement(): Stmt {
    const objToken = this.consume(TokenType.IDENTIFIER, ['list name']);
    this.consume(TokenType.DOT, ['"."']);
    const methodToken = this.consume(TokenType.IDENTIFIER, ['method name']);
    const method = methodToken.value;
    // List methods
    const listMethods: Record<string, { type: Stmt['type']; params: string[] }> = {
      'push': { type: 'ListPush', params: ['list', 'value'] },
      'pop': { type: 'ListPop', params: ['list'] },
      'length': { type: 'ListLength', params: ['list'] },
      'contains': { type: 'ListContains', params: ['list', 'value'] },
      'indexOf': { type: 'ListIndexOf', params: ['list', 'value'] },
      'remove': { type: 'ListRemove', params: ['list', 'index'] },
      'slice': { type: 'ListSlice', params: ['list', 'start', 'end'] },
      'sort': { type: 'ListSort', params: ['list'] },
      'reverse': { type: 'ListReverse', params: ['list'] },
    };

    if (listMethods[method]) {
      const info = listMethods[method];
      const args: Expr[] = [];
      // Optional parentheses - support both "obj.method(args)" and "obj.method args"
      let hasParens = false;
      if (this.match(TokenType.LPAREN)) {
        hasParens = true;
        if (!this.check(TokenType.RPAREN)) {
          do {
            args.push(this.expression());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, ['")"']);
      } else if (info.params.length > 1 || (info.params.length === 1 && info.params[0] !== 'list')) {
        // Parse space-separated argument (e.g., "list.push 6")
        while (!this.check(TokenType.NEWLINE) && !this.check(TokenType.EOF) &&
               !this.check(TokenType.INTO) && !this.check(TokenType.END)) {
          args.push(this.expression());
          if (args.length >= info.params.length - 1) break;
        }
      }

      let target: string | undefined;
      if (this.match(TokenType.INTO)) {
        const targetToken = this.consumeName(['variable name']);
        target = targetToken.value;
      }
      this.consumeNewline();

      // Build identifier expression for the list
      const listExpr: Expr = { type: 'Identifier', name: objToken.value };

      const stmt: any = { type: info.type };
      info.params.forEach((param, i) => {
        if (param === 'list') {
          stmt[param] = listExpr;
        } else {
          stmt[param] = args[i] || listExpr;
        }
      });
      if (target) stmt.target = target;
      return stmt;
    }

    // Dict methods would go here
    throw new SimpleError(`Unknown method "${method}".`, methodToken.line, methodToken.column);
  }

  // Handle "list.method args" syntax without dot (e.g., "numbers.push 6", "nums.contains 4")
  private spaceDelimMethodCall(): Stmt {
    const objToken = this.consume(TokenType.IDENTIFIER, ['list name']);
    const listName = objToken.value;

    // Get the method name (could be IDENTIFIER or keyword)
    let methodName: string;
    if (this.check(TokenType.IDENTIFIER)) {
      methodName = this.advance().value;
    } else if (this.match(TokenType.LENGTH)) {
      methodName = 'length';
    } else if (this.match(TokenType.CONTAINS)) {
      methodName = 'contains';
    } else {
      throw unexpectedToken(this.peek(), ['method name']);
    }

    const listMethods: Record<string, { type: Stmt['type']; params: string[] }> = {
      'push': { type: 'ListPush', params: ['list', 'value'] },
      'pop': { type: 'ListPop', params: ['list'] },
      'length': { type: 'ListLength', params: ['list'] },
      'contains': { type: 'ListContains', params: ['list', 'value'] },
      'indexOf': { type: 'ListIndexOf', params: ['list', 'value'] },
      'remove': { type: 'ListRemove', params: ['list', 'index'] },
      'slice': { type: 'ListSlice', params: ['list', 'start', 'end'] },
      'sort': { type: 'ListSort', params: ['list'] },
      'reverse': { type: 'ListReverse', params: ['list'] },
    };

    const info = listMethods[methodName.toLowerCase()];
    if (!info) {
      throw unexpectedToken(this.peek(), Object.keys(listMethods));
    }

    // Parse arguments (exclude "into" which is for the target)
    const args: Expr[] = [];
    while (!this.check(TokenType.NEWLINE) && !this.check(TokenType.EOF) &&
           !this.check(TokenType.INTO) && !this.check(TokenType.END)) {
      args.push(this.expression());
      break; // Only one arg for now
    }

    let target: string | undefined;
    if (this.match(TokenType.INTO)) {
      target = this.consumeName(['variable name']).value;
    }
    this.consumeNewline();

    // Build identifier expression for the list
    const listExpr: Expr = { type: 'Identifier', name: listName };

    const stmt: any = { type: info.type };
    info.params.forEach((param, i) => {
      if (param === 'list') {
        stmt[param] = listExpr;
      } else {
        stmt[param] = args[i] || listExpr;
      }
    });
    if (target) stmt.target = target;
    return stmt;
  }

  // Expression parsing with precedence climbing
  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    const expr = this.logicalOr();
    return expr;
  }

  private logicalOr(): Expr {
    let expr = this.logicalAnd();
    while (this.match(TokenType.OR)) {
      const operator = this.previous().type;
      const right = this.logicalAnd();
      expr = { type: 'Binary', left: expr, operator, right };
    }
    return expr;
  }

  private logicalAnd(): Expr {
    let expr = this.equality();
    while (this.match(TokenType.AND)) {
      const operator = this.previous().type;
      const right = this.equality();
      expr = { type: 'Binary', left: expr, operator, right };
    }
    return expr;
  }

  private equality(): Expr {
    let expr = this.comparison();
    while (this.match(TokenType.IS, TokenType.IS_NOT)) {
      // Check if this is a comparison phrase like "is greater than", "is less than"
      if (this.check(TokenType.GREATER_THAN) || this.check(TokenType.LESS_THAN) ||
          this.check(TokenType.GREATER_EQUAL) || this.check(TokenType.LESS_EQUAL)) {
        const operator = this.advance().type; // consume GREATER_THAN, LESS_THAN, etc.
        // Optional "to" after comparison operators
        this.match(TokenType.TO);
        const right = this.comparison();
        expr = { type: 'Binary', left: expr, operator, right };
      } else {
        const operator = this.previous().type;
        const right = this.comparison();
        expr = { type: 'Binary', left: expr, operator, right };
      }
    }
    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();
    while (this.match(TokenType.GREATER_THAN, TokenType.LESS_THAN, TokenType.GREATER_EQUAL, TokenType.LESS_EQUAL)) {
      const operator = this.previous().type;
      const right = this.term();
      expr = { type: 'Binary', left: expr, operator, right };
    }
    return expr;
  }

  private term(): Expr {
    let expr = this.factor();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous().type;
      const right = this.factor();
      expr = { type: 'Binary', left: expr, operator, right };
    }
    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDED_BY, TokenType.MOD)) {
      const operator = this.previous().type;
      const right = this.unary();
      expr = { type: 'Binary', left: expr, operator, right };
    }
    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
      const operator = this.previous().type;
      const operand = this.unary();
      return { type: 'Unary', operator, operand };
    }
    return this.call();
  }

  private call(): Expr {
    let expr = this.primary();
    let canCall = expr.type === 'Identifier' || expr.type === 'Call';

    while (true) {
      if (this.match(TokenType.LPAREN)) {
        if (!canCall) {
          // This is a grouping parenthesis, not a function call
          // Put the token back and return the expression
          this.current--; // backtrack
          return expr;
        }
        const args: Expr[] = [];
        if (!this.check(TokenType.RPAREN)) {
          do {
            args.push(this.expression());
          } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RPAREN, ['")"']);
        expr = { type: 'Call', callee: expr, args };
        canCall = true; // chained calls are allowed
      } else if (this.match(TokenType.LBRACKET)) {
        const index = this.expression();
        this.consume(TokenType.RBRACKET, ['"]"']);
        expr = { type: 'Index', object: expr, index };
        canCall = false;
      } else if (this.match(TokenType.DOT)) {
        // Accept identifier or keyword as property name (for things like .length, .push, .int, etc.)
        let propertyName: string;
        if (this.check(TokenType.IDENTIFIER)) {
          propertyName = this.consume(TokenType.IDENTIFIER, ['property name']).value;
        } else if (this.match(TokenType.LENGTH)) {
          propertyName = 'length';
        } else if (this.match(TokenType.INT)) {
          propertyName = 'int';
        } else if (this.match(TokenType.FLOAT)) {
          propertyName = 'float';
        } else if (this.match(TokenType.CHOICE)) {
          propertyName = 'choice';
        } else if (this.match(TokenType.SHUFFLE)) {
          propertyName = 'shuffle';
        } else if (this.match(TokenType.BOOL)) {
          propertyName = 'bool';
        } else if (this.match(TokenType.CONTAINS)) {
          propertyName = 'contains';
        } else if (this.match(TokenType.UPPER)) {
          propertyName = 'upper';
        } else if (this.match(TokenType.LOWER)) {
          propertyName = 'lower';
        } else if (this.match(TokenType.TRIM)) {
          propertyName = 'trim';
        } else if (this.match(TokenType.SPLIT)) {
          propertyName = 'split';
        } else if (this.match(TokenType.JOIN)) {
          propertyName = 'join';
        } else if (this.match(TokenType.REPLACE)) {
          propertyName = 'replace';
        } else if (this.match(TokenType.SUBSTRING)) {
          propertyName = 'substring';
        } else if (this.match(TokenType.STARTS_WITH)) {
          propertyName = 'startsWith';
        } else if (this.match(TokenType.ENDS_WITH)) {
          propertyName = 'endsWith';
        } else if (this.match(TokenType.ABS)) {
          propertyName = 'abs';
        } else if (this.match(TokenType.ROUND)) {
          propertyName = 'round';
        } else if (this.match(TokenType.FLOOR)) {
          propertyName = 'floor';
        } else if (this.match(TokenType.CEIL)) {
          propertyName = 'ceil';
        } else if (this.match(TokenType.SQRT)) {
          propertyName = 'sqrt';
        } else if (this.match(TokenType.POW)) {
          propertyName = 'pow';
        } else if (this.match(TokenType.MIN)) {
          propertyName = 'min';
        } else if (this.match(TokenType.MAX)) {
          propertyName = 'max';
        } else if (this.match(TokenType.CLAMP)) {
          propertyName = 'clamp';
        } else if (this.match(TokenType.RANDOM)) {
          propertyName = 'random';
        } else if (this.match(TokenType.PI)) {
          propertyName = 'pi';
        } else if (this.match(TokenType.E)) {
          propertyName = 'e';
        } else {
          throw unexpectedToken(this.peek(), ['property name']);
        }
        expr = { type: 'Property', object: expr, property: propertyName };
        canCall = true; // allow it to be called as a method (e.g., random.int)
        // Check for space-separated arguments (e.g., "random.int 1 to 100")
        // After a property access like random.int, parse arguments until newline or end
        if (this.isModuleCallStart(propertyName)) {
          const args = this.parseModuleCallArgs();
          if (args.length > 0) {
            expr = { type: 'Call', callee: expr, args };
            canCall = true;
          }
        }
      } else {
        break;
      }
    }

    return expr;
  }

  private primary(): Expr {
    // Call function expression: call name with args
    if (this.match(TokenType.CALL)) {
      const nameToken = this.consumeName(['function name']);
      const args: Expr[] = [];
      if (this.match(TokenType.WITH)) {
        do {
          args.push(this.expression());
        } while (this.match(TokenType.COMMA));
      }
      return { type: 'Call', callee: { type: 'Identifier', name: nameToken.value }, args };
    }

    // Literals
    if (this.match(TokenType.STRING)) {
      return { type: 'Literal', value: this.previous().value };
    }
    if (this.match(TokenType.NUMBER)) {
      return { type: 'Literal', value: parseFloat(this.previous().value) };
    }
    if (this.match(TokenType.BOOLEAN)) {
      return { type: 'Literal', value: this.previous().value === 'true' };
    }

    // List literal
    if (this.match(TokenType.LBRACKET)) {
      const elements: Expr[] = [];
      if (!this.check(TokenType.RBRACKET)) {
        do {
          elements.push(this.expression());
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RBRACKET, ['"]"']);
      return { type: 'List', elements };
    }

    // Dict literal
    if (this.match(TokenType.LBRACE)) {
      const entries: { key: string; value: Expr }[] = [];
      if (!this.check(TokenType.RBRACE)) {
        do {
          const keyToken = this.consume(TokenType.IDENTIFIER, ['key name']);
          this.consume(TokenType.COLON, ['":"']);
          const value = this.expression();
          entries.push({ key: keyToken.value, value });
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RBRACE, ['"}"']);
      return { type: 'Dict', entries };
    }

    // Grouping
    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RPAREN, ['")"']);
      return expr;
    }

    // Identifier
    if (this.match(TokenType.IDENTIFIER)) {
      return { type: 'Identifier', name: this.previous().value };
    }

    // Accept any keyword as an identifier (for variables/functions named like keywords)
    const token = this.peek();
    if (token.type !== TokenType.EOF && token.type !== TokenType.NEWLINE &&
        token.type !== TokenType.COMMENT && token.value &&
        token.type !== TokenType.RPAREN && token.type !== TokenType.RBRACKET &&
        token.type !== TokenType.RBRACE && token.type !== TokenType.COMMA &&
        token.type !== TokenType.COLON && token.type !== TokenType.DOT) {
      this.advance();
      return { type: 'Identifier', name: token.value };
    }

    throw unexpectedToken(this.peek(), ['expression']);
  }

  // Utility methods
  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return type === TokenType.EOF;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(offset = 0): Token {
    return this.tokens[this.current + offset];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, expected: string[]): Token {
    if (this.check(type)) return this.advance();
    throw unexpectedToken(this.peek(), expected);
  }

  // Accept identifier or keyword as a name (for variable/function names that collide with keywords)
  private consumeName(expected: string[]): Token {
    if (this.check(TokenType.IDENTIFIER)) return this.advance();
    // Accept any keyword token as a name
    const token = this.peek();
    if (token.type !== TokenType.EOF && token.type !== TokenType.NEWLINE &&
        token.type !== TokenType.COMMENT && token.value) {
      return this.advance();
    }
    throw unexpectedToken(this.peek(), expected);
  }

  private consumeNewline(): void {
    while (this.check(TokenType.NEWLINE)) this.advance();
  }
}