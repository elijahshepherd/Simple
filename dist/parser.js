"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const lexer_js_1 = require("./lexer.js");
const errors_js_1 = require("./errors.js");
class Parser {
    tokens;
    current = 0;
    sourceLines;
    constructor(source) {
        this.tokens = (0, lexer_js_1.lex)(source);
        this.sourceLines = source.split('\n');
    }
    parse() {
        const statements = [];
        while (!this.check(lexer_js_1.TokenType.EOF)) {
            if (this.check(lexer_js_1.TokenType.NEWLINE)) {
                this.advance();
                continue;
            }
            if (this.check(lexer_js_1.TokenType.COMMENT)) {
                this.advance();
                continue;
            }
            statements.push(this.statement());
        }
        return { statements };
    }
    statement() {
        // Import
        if (this.match(lexer_js_1.TokenType.IMPORT))
            return this.importStatement();
        // Say
        if (this.match(lexer_js_1.TokenType.SAY))
            return this.sayStatement();
        // Ask
        if (this.match(lexer_js_1.TokenType.ASK))
            return this.askStatement();
        // Remember / Constant
        if (this.match(lexer_js_1.TokenType.REMEMBER))
            return this.rememberStatement(false);
        if (this.match(lexer_js_1.TokenType.CONSTANT))
            return this.rememberStatement(true);
        // If
        if (this.match(lexer_js_1.TokenType.IF))
            return this.ifStatement();
        // Repeat
        if (this.match(lexer_js_1.TokenType.REPEAT))
            return this.repeatStatement();
        // Function
        if (this.match(lexer_js_1.TokenType.FUNCTION))
            return this.functionStatement();
        // Return
        if (this.match(lexer_js_1.TokenType.RETURN))
            return this.returnStatement();
        // Call
        if (this.match(lexer_js_1.TokenType.CALL))
            return this.callStatement();
        // Wait
        if (this.match(lexer_js_1.TokenType.WAIT))
            return this.waitStatement();
        // Clear
        if (this.match(lexer_js_1.TokenType.CLEAR))
            return { type: 'Clear' };
        // Exit
        if (this.match(lexer_js_1.TokenType.EXIT))
            return this.exitStatement();
        // File operations
        if (this.match(lexer_js_1.TokenType.CREATE)) {
            if (this.match(lexer_js_1.TokenType.FILE))
                return this.createFileStatement();
            if (this.match(lexer_js_1.TokenType.FOLDER) || this.match(lexer_js_1.TokenType.MAKE))
                return this.createFolderStatement();
        }
        if (this.match(lexer_js_1.TokenType.DELETE)) {
            if (this.match(lexer_js_1.TokenType.FILE))
                return this.deleteFileStatement();
            if (this.match(lexer_js_1.TokenType.FOLDER))
                return this.deleteFolderStatement();
        }
        if (this.match(lexer_js_1.TokenType.WRITE) || this.match(lexer_js_1.TokenType.APPEND)) {
            const append = this.previous().type === lexer_js_1.TokenType.APPEND;
            return this.writeFileStatement(append);
        }
        if (this.match(lexer_js_1.TokenType.READ))
            return this.readFileStatement();
        if (this.match(lexer_js_1.TokenType.COPY) && this.match(lexer_js_1.TokenType.FILE))
            return this.copyFileStatement();
        if (this.match(lexer_js_1.TokenType.MOVE) && this.match(lexer_js_1.TokenType.FILE))
            return this.moveFileStatement();
        if (this.match(lexer_js_1.TokenType.RENAME) && this.match(lexer_js_1.TokenType.FILE))
            return this.renameFileStatement();
        if (this.match(lexer_js_1.TokenType.EXISTS) && this.match(lexer_js_1.TokenType.FILE))
            return this.fileExistsStatement();
        if (this.match(lexer_js_1.TokenType.PATH))
            return this.pathStatement();
        if (this.match(lexer_js_1.TokenType.LIST) && this.match(lexer_js_1.TokenType.FOLDER))
            return this.listFolderStatement();
        if (this.match(lexer_js_1.TokenType.EXISTS) && this.match(lexer_js_1.TokenType.FOLDER))
            return this.folderExistsStatement();
        // System
        if (this.match(lexer_js_1.TokenType.ARGS))
            return this.argsStatement();
        if (this.match(lexer_js_1.TokenType.ENV))
            return this.envStatement();
        if (this.match(lexer_js_1.TokenType.RUN))
            return this.runCommandStatement();
        if (this.match(lexer_js_1.TokenType.PLATFORM))
            return this.platformStatement();
        if (this.match(lexer_js_1.TokenType.ARCH))
            return this.archStatement();
        // Random
        if (this.match(lexer_js_1.TokenType.RANDOM))
            return this.randomStatement();
        // Time
        if (this.match(lexer_js_1.TokenType.NOW))
            return this.timeStatement();
        if (this.match(lexer_js_1.TokenType.SLEEP))
            return this.sleepStatement();
        if (this.match(lexer_js_1.TokenType.FORMAT))
            return this.formatStatement();
        // Text
        if (this.match(lexer_js_1.TokenType.TEXT))
            return this.textStatement();
        // Math
        if (this.match(lexer_js_1.TokenType.MATH))
            return this.mathStatement();
        // List operations
        if (this.check(lexer_js_1.TokenType.IDENTIFIER)) {
            const next = this.peek(1);
            if (next?.type === lexer_js_1.TokenType.DOT) {
                return this.methodCallStatement();
            }
            // Handle "list.method args" syntax without dot (e.g., "numbers.push 6")
            // The method name can be IDENTIFIER or a keyword like LENGTH, CONTAINS
            if (next && (next.type === lexer_js_1.TokenType.IDENTIFIER ||
                next.type === lexer_js_1.TokenType.LENGTH || next.type === lexer_js_1.TokenType.CONTAINS)) {
                return this.spaceDelimMethodCall();
            }
        }
        // Expression statement (fallback)
        const expr = this.expression();
        this.consumeNewline();
        return { type: 'Expression', expr };
    }
    importStatement() {
        const nameToken = this.consumeName(['module name']);
        let alias;
        if (this.match(lexer_js_1.TokenType.AS)) {
            const aliasToken = this.consumeName(['alias name']);
            alias = aliasToken.value;
        }
        this.consumeNewline();
        return { type: 'Import', module: nameToken.value.toLowerCase(), alias };
    }
    sayStatement() {
        const styles = [];
        // Parse color/style modifiers before the expression
        while (true) {
            if (this.match(lexer_js_1.TokenType.RED))
                styles.push('red');
            else if (this.match(lexer_js_1.TokenType.GREEN))
                styles.push('green');
            else if (this.match(lexer_js_1.TokenType.BLUE))
                styles.push('blue');
            else if (this.match(lexer_js_1.TokenType.YELLOW))
                styles.push('yellow');
            else if (this.match(lexer_js_1.TokenType.CYAN))
                styles.push('cyan');
            else if (this.match(lexer_js_1.TokenType.MAGENTA))
                styles.push('magenta');
            else if (this.match(lexer_js_1.TokenType.WHITE))
                styles.push('white');
            else if (this.match(lexer_js_1.TokenType.BLACK))
                styles.push('black');
            else if (this.match(lexer_js_1.TokenType.BRIGHT))
                styles.push('bright');
            else if (this.match(lexer_js_1.TokenType.BOLD))
                styles.push('bold');
            else if (this.match(lexer_js_1.TokenType.ITALIC))
                styles.push('italic');
            else if (this.match(lexer_js_1.TokenType.UNDERLINE))
                styles.push('underline');
            else if (this.match(lexer_js_1.TokenType.RESET))
                styles.push('reset');
            else if (this.match(lexer_js_1.TokenType.BG_RED))
                styles.push('bgRed');
            else if (this.match(lexer_js_1.TokenType.BG_GREEN))
                styles.push('bgGreen');
            else if (this.match(lexer_js_1.TokenType.BG_BLUE))
                styles.push('bgBlue');
            else if (this.match(lexer_js_1.TokenType.BG_YELLOW))
                styles.push('bgYellow');
            else if (this.match(lexer_js_1.TokenType.BG_CYAN))
                styles.push('bgCyan');
            else if (this.match(lexer_js_1.TokenType.BG_MAGENTA))
                styles.push('bgMagenta');
            else if (this.match(lexer_js_1.TokenType.BG_WHITE))
                styles.push('bgWhite');
            else if (this.match(lexer_js_1.TokenType.BG_BLACK))
                styles.push('bgBlack');
            else
                break;
        }
        // Parse first expression
        let expr = this.expression();
        // Parse additional expressions for implicit concatenation
        // Check if next token could start an expression (for implicit concatenation)
        while (this.isExpressionStart()) {
            const right = this.expression();
            expr = { type: 'Binary', left: expr, operator: lexer_js_1.TokenType.PLUS, right };
        }
        this.consumeNewline();
        return { type: 'Say', expr, styles };
    }
    // Check if current token can start an expression (for implicit concatenation in say)
    isExpressionStart() {
        const token = this.peek();
        return (token.type === lexer_js_1.TokenType.STRING ||
            token.type === lexer_js_1.TokenType.NUMBER ||
            token.type === lexer_js_1.TokenType.BOOLEAN ||
            token.type === lexer_js_1.TokenType.IDENTIFIER ||
            token.type === lexer_js_1.TokenType.CALL ||
            token.type === lexer_js_1.TokenType.LPAREN ||
            token.type === lexer_js_1.TokenType.LBRACKET ||
            token.type === lexer_js_1.TokenType.LBRACE ||
            token.type === lexer_js_1.TokenType.MINUS ||
            token.type === lexer_js_1.TokenType.NOT);
    }
    // Check if a property name is a module method that can be called with space-separated args
    isModuleCallStart(method) {
        const moduleMethods = new Set(['int', 'float', 'choice', 'shuffle', 'bool',
            'upper', 'lower', 'trim', 'split', 'join', 'replace', 'contains',
            'startswith', 'endswith', 'substring',
            'abs', 'round', 'floor', 'ceil', 'sqrt', 'pow', 'min', 'max', 'clamp',
            'random', 'pi', 'e', 'indexof', 'remove', 'slice', 'sort', 'reverse',
            'pop', 'push']);
        return moduleMethods.has(method.toLowerCase());
    }
    // Parse arguments for a module-style call like "random.int 1 to 100"
    // Arguments are separated by "to", "from", "with", "as", "by", "into" or end of line
    parseModuleCallArgs() {
        const args = [];
        const separators = new Set([
            lexer_js_1.TokenType.TO, lexer_js_1.TokenType.FROM, lexer_js_1.TokenType.WITH, lexer_js_1.TokenType.AS, lexer_js_1.TokenType.BY,
            lexer_js_1.TokenType.INTO, lexer_js_1.TokenType.NEWLINE, lexer_js_1.TokenType.EOF, lexer_js_1.TokenType.OTHERWISE,
            lexer_js_1.TokenType.END, lexer_js_1.TokenType.COMMA
        ]);
        while (!this.isAtEnd() && !separators.has(this.peek().type) && this.isExpressionStart()) {
            args.push(this.expression());
            // After an expression, check if we have a separator like "to" that should be consumed
            if (this.isAtEnd())
                break;
            if (separators.has(this.peek().type)) {
                // Consume the separator (e.g., "to" in "random.int 1 to 100")
                this.advance();
                // Check if we should continue parsing more arguments
                if (this.isAtEnd() || !this.isExpressionStart())
                    break;
            }
            else {
                break;
            }
        }
        return args;
    }
    askStatement() {
        const prompt = this.expression();
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'Ask', prompt, target: target.value };
    }
    rememberStatement(constant) {
        const nameToken = this.consumeName(['variable name']);
        this.consume(lexer_js_1.TokenType.AS, ['"as"']);
        const value = this.expression();
        this.consumeNewline();
        return { type: 'Remember', name: nameToken.value, value, constant };
    }
    ifStatement() {
        const condition = this.expression();
        this.consumeNewline();
        const thenBranch = [];
        while (!this.check(lexer_js_1.TokenType.OTHERWISE) && !this.check(lexer_js_1.TokenType.END) && !this.check(lexer_js_1.TokenType.EOF)) {
            if (this.check(lexer_js_1.TokenType.NEWLINE)) {
                this.advance();
                continue;
            }
            if (this.check(lexer_js_1.TokenType.COMMENT)) {
                this.advance();
                continue;
            }
            thenBranch.push(this.statement());
        }
        let elseBranch = [];
        if (this.match(lexer_js_1.TokenType.OTHERWISE)) {
            this.consumeNewline();
            while (!this.check(lexer_js_1.TokenType.END) && !this.check(lexer_js_1.TokenType.EOF)) {
                if (this.check(lexer_js_1.TokenType.NEWLINE)) {
                    this.advance();
                    continue;
                }
                if (this.check(lexer_js_1.TokenType.COMMENT)) {
                    this.advance();
                    continue;
                }
                elseBranch.push(this.statement());
            }
        }
        this.consume(lexer_js_1.TokenType.END, ['"end"']);
        this.consumeNewline();
        return { type: 'If', condition, thenBranch, elseBranch };
    }
    repeatStatement() {
        // Check for "repeat N times" or "repeat while condition"
        if (this.check(lexer_js_1.TokenType.NUMBER) || this.check(lexer_js_1.TokenType.IDENTIFIER) || this.check(lexer_js_1.TokenType.LPAREN)) {
            const count = this.expression();
            this.consume(lexer_js_1.TokenType.TIMES, ['"times"']);
            this.consumeNewline();
            const body = [];
            while (!this.check(lexer_js_1.TokenType.END) && !this.check(lexer_js_1.TokenType.EOF)) {
                if (this.check(lexer_js_1.TokenType.NEWLINE)) {
                    this.advance();
                    continue;
                }
                if (this.check(lexer_js_1.TokenType.COMMENT)) {
                    this.advance();
                    continue;
                }
                body.push(this.statement());
            }
            this.consume(lexer_js_1.TokenType.END, ['"end"']);
            this.consumeNewline();
            return { type: 'RepeatTimes', count, body };
        }
        if (this.match(lexer_js_1.TokenType.WHILE)) {
            const condition = this.expression();
            this.consumeNewline();
            const body = [];
            while (!this.check(lexer_js_1.TokenType.END) && !this.check(lexer_js_1.TokenType.EOF)) {
                if (this.check(lexer_js_1.TokenType.NEWLINE)) {
                    this.advance();
                    continue;
                }
                if (this.check(lexer_js_1.TokenType.COMMENT)) {
                    this.advance();
                    continue;
                }
                body.push(this.statement());
            }
            this.consume(lexer_js_1.TokenType.END, ['"end"']);
            this.consumeNewline();
            return { type: 'RepeatWhile', condition, body };
        }
        throw (0, errors_js_1.unexpectedToken)(this.peek(), ['number', 'identifier', '"while"']);
    }
    functionStatement() {
        const nameToken = this.consumeName(['function name']);
        const params = [];
        // Support both "function name(params)" and "function name with params"
        if (this.match(lexer_js_1.TokenType.LPAREN)) {
            // Syntax: function name(param1, param2)
            if (!this.check(lexer_js_1.TokenType.RPAREN)) {
                do {
                    const param = this.consumeName(['parameter name']);
                    params.push(param.value);
                } while (this.match(lexer_js_1.TokenType.COMMA));
            }
            this.consume(lexer_js_1.TokenType.RPAREN, ['")"']);
        }
        else if (this.match(lexer_js_1.TokenType.WITH)) {
            // Syntax: function name with param1, param2
            do {
                const param = this.consumeName(['parameter name']);
                params.push(param.value);
            } while (this.match(lexer_js_1.TokenType.COMMA));
        }
        this.consumeNewline();
        const body = [];
        while (!this.check(lexer_js_1.TokenType.END) && !this.check(lexer_js_1.TokenType.EOF)) {
            if (this.check(lexer_js_1.TokenType.NEWLINE)) {
                this.advance();
                continue;
            }
            if (this.check(lexer_js_1.TokenType.COMMENT)) {
                this.advance();
                continue;
            }
            body.push(this.statement());
        }
        this.consume(lexer_js_1.TokenType.END, ['"end"']);
        this.consumeNewline();
        return { type: 'Function', name: nameToken.value, params, body };
    }
    returnStatement() {
        let value;
        if (!this.check(lexer_js_1.TokenType.NEWLINE) && !this.check(lexer_js_1.TokenType.EOF) && !this.check(lexer_js_1.TokenType.END)) {
            value = this.expression();
            // Parse additional expressions for implicit concatenation (like in say)
            while (this.isExpressionStart()) {
                const right = this.expression();
                value = { type: 'Binary', left: value, operator: lexer_js_1.TokenType.PLUS, right };
            }
        }
        this.consumeNewline();
        return { type: 'Return', value };
    }
    callStatement() {
        const nameToken = this.consumeName(['function name']);
        const args = [];
        if (this.match(lexer_js_1.TokenType.WITH)) {
            do {
                args.push(this.expression());
            } while (this.match(lexer_js_1.TokenType.COMMA));
        }
        this.consumeNewline();
        return { type: 'Call', name: nameToken.value, args };
    }
    waitStatement() {
        const duration = this.expression();
        this.match(lexer_js_1.TokenType.SECONDS); // optional "seconds"
        this.consumeNewline();
        return { type: 'Wait', duration };
    }
    exitStatement() {
        let code;
        if (!this.check(lexer_js_1.TokenType.NEWLINE) && !this.check(lexer_js_1.TokenType.EOF)) {
            code = this.expression();
        }
        this.consumeNewline();
        return { type: 'Exit', code };
    }
    createFileStatement() {
        const path = this.expression();
        this.consumeNewline();
        return { type: 'CreateFile', path };
    }
    createFolderStatement() {
        const path = this.expression();
        this.consumeNewline();
        return { type: 'CreateFolder', path };
    }
    deleteFileStatement() {
        const path = this.expression();
        this.consumeNewline();
        return { type: 'DeleteFile', path };
    }
    deleteFolderStatement() {
        const path = this.expression();
        this.consumeNewline();
        return { type: 'DeleteFolder', path };
    }
    writeFileStatement(append) {
        const content = this.expression();
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const path = this.expression();
        this.consumeNewline();
        return { type: 'WriteFile', path, content, append };
    }
    readFileStatement() {
        const path = this.expression();
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'ReadFile', path, target: target.value };
    }
    copyFileStatement() {
        const from = this.expression();
        this.consume(lexer_js_1.TokenType.TO, ['"to"']); // We'll need to add TO token
        const to = this.expression();
        this.consumeNewline();
        return { type: 'CopyFile', from, to };
    }
    moveFileStatement() {
        const from = this.expression();
        this.consume(lexer_js_1.TokenType.TO, ['"to"']);
        const to = this.expression();
        this.consumeNewline();
        return { type: 'MoveFile', from, to };
    }
    renameFileStatement() {
        const from = this.expression();
        this.consume(lexer_js_1.TokenType.TO, ['"to"']);
        const to = this.expression();
        this.consumeNewline();
        return { type: 'RenameFile', from, to };
    }
    fileExistsStatement() {
        const path = this.expression();
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'FileExists', path, target: target.value };
    }
    pathStatement() {
        if (this.match(lexer_js_1.TokenType.JOIN)) {
            const parts = [];
            do {
                parts.push(this.expression());
            } while (this.match(lexer_js_1.TokenType.COMMA));
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'PathJoin', parts, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.DIR)) {
            const path = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'PathDir', path, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.NAME)) {
            const path = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'PathName', path, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.EXT)) {
            const path = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'PathExt', path, target: target.value };
        }
        throw (0, errors_js_1.unexpectedToken)(this.peek(), ['"join"', '"dir"', '"name"', '"ext"']);
    }
    listFolderStatement() {
        const path = this.expression();
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'ListFolder', path, target: target.value };
    }
    folderExistsStatement() {
        const path = this.expression();
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'FolderExists', path, target: target.value };
    }
    argsStatement() {
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'Args', target: target.value };
    }
    envStatement() {
        if (this.match(lexer_js_1.TokenType.GET)) {
            const key = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'EnvGet', key, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.SET)) {
            const key = this.expression();
            this.consume(lexer_js_1.TokenType.AS, ['"as"']);
            const value = this.expression();
            this.consumeNewline();
            return { type: 'EnvSet', key, value };
        }
        throw (0, errors_js_1.unexpectedToken)(this.peek(), ['"get"', '"set"']);
    }
    runCommandStatement() {
        const command = this.expression();
        let target;
        if (this.match(lexer_js_1.TokenType.INTO)) {
            const targetToken = this.consumeName(['variable name']);
            target = targetToken.value;
        }
        this.consumeNewline();
        return { type: 'RunCommand', command, target };
    }
    platformStatement() {
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'Platform', target: target.value };
    }
    archStatement() {
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'Arch', target: target.value };
    }
    randomStatement() {
        // Handle optional dot after random (random.int, random.float, etc.)
        this.match(lexer_js_1.TokenType.DOT);
        if (this.match(lexer_js_1.TokenType.INT)) {
            const min = this.expression();
            this.consume(lexer_js_1.TokenType.TO, ['"to"']);
            const max = this.expression();
            // Random can be used as expression (no into) or statement (with into)
            if (this.match(lexer_js_1.TokenType.INTO)) {
                const target = this.consumeName(['variable name']);
                this.consumeNewline();
                return { type: 'RandomInt', min, max, target: target.value };
            }
            this.consumeNewline();
            return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.int' }, args: [min, max] } };
        }
        if (this.match(lexer_js_1.TokenType.FLOAT)) {
            const min = this.expression();
            this.consume(lexer_js_1.TokenType.TO, ['"to"']);
            const max = this.expression();
            if (this.match(lexer_js_1.TokenType.INTO)) {
                const target = this.consumeName(['variable name']);
                this.consumeNewline();
                return { type: 'RandomFloat', min, max, target: target.value };
            }
            this.consumeNewline();
            return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.float' }, args: [min, max] } };
        }
        if (this.match(lexer_js_1.TokenType.CHOICE)) {
            this.consume(lexer_js_1.TokenType.FROM, ['"from"']);
            const list = this.expression();
            if (this.match(lexer_js_1.TokenType.INTO)) {
                const target = this.consumeName(['variable name']);
                this.consumeNewline();
                return { type: 'RandomChoice', list, target: target.value };
            }
            this.consumeNewline();
            return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.choice' }, args: [list] } };
        }
        if (this.match(lexer_js_1.TokenType.SHUFFLE)) {
            const list = this.expression();
            if (this.match(lexer_js_1.TokenType.INTO)) {
                const target = this.consumeName(['variable name']);
                this.consumeNewline();
                return { type: 'RandomShuffle', list, target: target.value };
            }
            this.consumeNewline();
            return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.shuffle' }, args: [list] } };
        }
        if (this.match(lexer_js_1.TokenType.BOOL)) {
            if (this.match(lexer_js_1.TokenType.INTO)) {
                const target = this.consumeName(['variable name']);
                this.consumeNewline();
                return { type: 'RandomBool', target: target.value };
            }
            this.consumeNewline();
            return { type: 'Expression', expr: { type: 'Call', callee: { type: 'Identifier', name: 'random.bool' }, args: [] } };
        }
        throw (0, errors_js_1.unexpectedToken)(this.peek(), ['"int"', '"float"', '"choice"', '"shuffle"', '"bool"']);
    }
    timeStatement() {
        if (this.match(lexer_js_1.TokenType.NOW)) {
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TimeNow', target: target.value };
        }
        throw (0, errors_js_1.unexpectedToken)(this.peek(), ['"now"']);
    }
    sleepStatement() {
        const duration = this.expression();
        this.consumeNewline();
        return { type: 'TimeSleep', duration };
    }
    formatStatement() {
        const timestamp = this.expression();
        this.consume(lexer_js_1.TokenType.AS, ['"as"']);
        const format = this.expression();
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        return { type: 'TimeFormat', timestamp, format, target: target.value };
    }
    textStatement() {
        if (this.match(lexer_js_1.TokenType.UPPER)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextUpper', text, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.LOWER)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextLower', text, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.TRIM)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextTrim', text, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.SPLIT)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.BY, ['"by"']);
            const separator = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextSplit', text, separator, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.JOIN)) {
            const list = this.expression();
            this.consume(lexer_js_1.TokenType.WITH, ['"with"']);
            const separator = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextJoin', list, separator, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.REPLACE)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.WITH, ['"with"']);
            const search = this.expression();
            this.consume(lexer_js_1.TokenType.AS, ['"as"']);
            const replace = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextReplace', text, search, replace, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.LENGTH)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextLength', text, target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.CONTAINS)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextContains', text, search: this.expression(), target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.STARTS_WITH)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextStartsWith', text, prefix: this.expression(), target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.ENDS_WITH)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextEndsWith', text, suffix: this.expression(), target: target.value };
        }
        if (this.match(lexer_js_1.TokenType.SUBSTRING)) {
            const text = this.expression();
            this.consume(lexer_js_1.TokenType.FROM, ['"from"']);
            const start = this.expression();
            let end;
            if (this.match(lexer_js_1.TokenType.TO)) {
                end = this.expression();
            }
            this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
            const target = this.consumeName(['variable name']);
            this.consumeNewline();
            return { type: 'TextSubstring', text, start, end, target: target.value };
        }
        throw (0, errors_js_1.unexpectedToken)(this.peek(), ['text operation']);
    }
    mathStatement() {
        const ops = {
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
        const opToken = this.consume(lexer_js_1.TokenType.IDENTIFIER, ['math operation']);
        const op = ops[opToken.value.toLowerCase()];
        if (!op)
            throw (0, errors_js_1.unexpectedToken)(opToken, Object.keys(ops));
        const args = [];
        if (!this.check(lexer_js_1.TokenType.INTO)) {
            for (const param of op.params) {
                args.push(this.expression());
                if (param !== op.params[op.params.length - 1]) {
                    this.consume(lexer_js_1.TokenType.COMMA, ['","']);
                }
            }
        }
        this.consume(lexer_js_1.TokenType.INTO, ['"into"']);
        const target = this.consumeName(['variable name']);
        this.consumeNewline();
        const stmt = { type: op.type, target: target.value };
        op.params.forEach((param, i) => { stmt[param] = args[i]; });
        return stmt;
    }
    methodCallStatement() {
        const objToken = this.consume(lexer_js_1.TokenType.IDENTIFIER, ['list name']);
        this.consume(lexer_js_1.TokenType.DOT, ['"."']);
        const methodToken = this.consume(lexer_js_1.TokenType.IDENTIFIER, ['method name']);
        const method = methodToken.value;
        // List methods
        const listMethods = {
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
            const args = [];
            // Optional parentheses - support both "obj.method(args)" and "obj.method args"
            let hasParens = false;
            if (this.match(lexer_js_1.TokenType.LPAREN)) {
                hasParens = true;
                if (!this.check(lexer_js_1.TokenType.RPAREN)) {
                    do {
                        args.push(this.expression());
                    } while (this.match(lexer_js_1.TokenType.COMMA));
                }
                this.consume(lexer_js_1.TokenType.RPAREN, ['")"']);
            }
            else if (info.params.length > 1 || (info.params.length === 1 && info.params[0] !== 'list')) {
                // Parse space-separated argument (e.g., "list.push 6")
                while (!this.check(lexer_js_1.TokenType.NEWLINE) && !this.check(lexer_js_1.TokenType.EOF) &&
                    !this.check(lexer_js_1.TokenType.INTO) && !this.check(lexer_js_1.TokenType.END)) {
                    args.push(this.expression());
                    if (args.length >= info.params.length - 1)
                        break;
                }
            }
            let target;
            if (this.match(lexer_js_1.TokenType.INTO)) {
                const targetToken = this.consumeName(['variable name']);
                target = targetToken.value;
            }
            this.consumeNewline();
            // Build identifier expression for the list
            const listExpr = { type: 'Identifier', name: objToken.value };
            const stmt = { type: info.type };
            // Filter out the 'list' param to get the arg-only params
            const argParams = info.params.filter(p => p !== 'list');
            // stmt.list = listExpr (the list)
            stmt.list = listExpr;
            // The remaining args map to argParams in order
            argParams.forEach((param, i) => {
                stmt[param] = args[i] || listExpr;
            });
            if (target)
                stmt.target = target;
            return stmt;
        }
        // Dict methods would go here
        throw new errors_js_1.SimpleError(`Unknown method "${method}".`, methodToken.line, methodToken.column);
    }
    // Handle "list.method args" syntax without dot (e.g., "numbers.push 6", "nums.contains 4")
    spaceDelimMethodCall() {
        const objToken = this.consume(lexer_js_1.TokenType.IDENTIFIER, ['list name']);
        const listName = objToken.value;
        // Get the method name (could be IDENTIFIER or keyword)
        let methodName;
        if (this.check(lexer_js_1.TokenType.IDENTIFIER)) {
            methodName = this.advance().value;
        }
        else if (this.match(lexer_js_1.TokenType.LENGTH)) {
            methodName = 'length';
        }
        else if (this.match(lexer_js_1.TokenType.CONTAINS)) {
            methodName = 'contains';
        }
        else {
            throw (0, errors_js_1.unexpectedToken)(this.peek(), ['method name']);
        }
        const listMethods = {
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
            throw (0, errors_js_1.unexpectedToken)(this.peek(), Object.keys(listMethods));
        }
        // Parse arguments (exclude "into" which is for the target)
        const args = [];
        while (!this.check(lexer_js_1.TokenType.NEWLINE) && !this.check(lexer_js_1.TokenType.EOF) &&
            !this.check(lexer_js_1.TokenType.INTO) && !this.check(lexer_js_1.TokenType.END)) {
            args.push(this.expression());
            break; // Only one arg for now
        }
        let target;
        if (this.match(lexer_js_1.TokenType.INTO)) {
            target = this.consumeName(['variable name']).value;
        }
        this.consumeNewline();
        // Build identifier expression for the list
        const listExpr = { type: 'Identifier', name: listName };
        const stmt = { type: info.type };
        info.params.forEach((param, i) => {
            if (param === 'list') {
                stmt[param] = listExpr;
            }
            else {
                stmt[param] = args[i] || listExpr;
            }
        });
        if (target)
            stmt.target = target;
        return stmt;
    }
    // Expression parsing with precedence climbing
    expression() {
        return this.assignment();
    }
    assignment() {
        const expr = this.logicalOr();
        return expr;
    }
    logicalOr() {
        let expr = this.logicalAnd();
        while (this.match(lexer_js_1.TokenType.OR)) {
            const operator = this.previous().type;
            const right = this.logicalAnd();
            expr = { type: 'Binary', left: expr, operator, right };
        }
        return expr;
    }
    logicalAnd() {
        let expr = this.equality();
        while (this.match(lexer_js_1.TokenType.AND)) {
            const operator = this.previous().type;
            const right = this.equality();
            expr = { type: 'Binary', left: expr, operator, right };
        }
        return expr;
    }
    equality() {
        let expr = this.comparison();
        while (this.match(lexer_js_1.TokenType.IS, lexer_js_1.TokenType.IS_NOT)) {
            // Check if this is a comparison phrase like "is greater than", "is less than"
            if (this.check(lexer_js_1.TokenType.GREATER_THAN) || this.check(lexer_js_1.TokenType.LESS_THAN) ||
                this.check(lexer_js_1.TokenType.GREATER_EQUAL) || this.check(lexer_js_1.TokenType.LESS_EQUAL)) {
                const operator = this.advance().type; // consume GREATER_THAN, LESS_THAN, etc.
                // Optional "to" after comparison operators
                this.match(lexer_js_1.TokenType.TO);
                const right = this.comparison();
                expr = { type: 'Binary', left: expr, operator, right };
            }
            else {
                const operator = this.previous().type;
                const right = this.comparison();
                expr = { type: 'Binary', left: expr, operator, right };
            }
        }
        return expr;
    }
    comparison() {
        let expr = this.term();
        while (this.match(lexer_js_1.TokenType.GREATER_THAN, lexer_js_1.TokenType.LESS_THAN, lexer_js_1.TokenType.GREATER_EQUAL, lexer_js_1.TokenType.LESS_EQUAL)) {
            const operator = this.previous().type;
            const right = this.term();
            expr = { type: 'Binary', left: expr, operator, right };
        }
        return expr;
    }
    term() {
        let expr = this.factor();
        while (this.match(lexer_js_1.TokenType.PLUS, lexer_js_1.TokenType.MINUS)) {
            const operator = this.previous().type;
            const right = this.factor();
            expr = { type: 'Binary', left: expr, operator, right };
        }
        return expr;
    }
    factor() {
        let expr = this.unary();
        while (this.match(lexer_js_1.TokenType.MULTIPLY, lexer_js_1.TokenType.DIVIDED_BY, lexer_js_1.TokenType.MOD)) {
            const operator = this.previous().type;
            const right = this.unary();
            expr = { type: 'Binary', left: expr, operator, right };
        }
        return expr;
    }
    unary() {
        if (this.match(lexer_js_1.TokenType.NOT, lexer_js_1.TokenType.MINUS)) {
            const operator = this.previous().type;
            const operand = this.unary();
            return { type: 'Unary', operator, operand };
        }
        return this.call();
    }
    call() {
        let expr = this.primary();
        let canCall = expr.type === 'Identifier' || expr.type === 'Call';
        while (true) {
            if (this.match(lexer_js_1.TokenType.LPAREN)) {
                if (!canCall) {
                    // This is a grouping parenthesis, not a function call
                    // Put the token back and return the expression
                    this.current--; // backtrack
                    return expr;
                }
                const args = [];
                if (!this.check(lexer_js_1.TokenType.RPAREN)) {
                    do {
                        args.push(this.expression());
                    } while (this.match(lexer_js_1.TokenType.COMMA));
                }
                this.consume(lexer_js_1.TokenType.RPAREN, ['")"']);
                expr = { type: 'Call', callee: expr, args };
                canCall = true; // chained calls are allowed
            }
            else if (this.match(lexer_js_1.TokenType.LBRACKET)) {
                const index = this.expression();
                this.consume(lexer_js_1.TokenType.RBRACKET, ['"]"']);
                expr = { type: 'Index', object: expr, index };
                canCall = false;
            }
            else if (this.match(lexer_js_1.TokenType.DOT)) {
                // Accept identifier or keyword as property name (for things like .length, .push, .int, etc.)
                let propertyName;
                if (this.check(lexer_js_1.TokenType.IDENTIFIER)) {
                    propertyName = this.consume(lexer_js_1.TokenType.IDENTIFIER, ['property name']).value;
                }
                else if (this.match(lexer_js_1.TokenType.LENGTH)) {
                    propertyName = 'length';
                }
                else if (this.match(lexer_js_1.TokenType.INT)) {
                    propertyName = 'int';
                }
                else if (this.match(lexer_js_1.TokenType.FLOAT)) {
                    propertyName = 'float';
                }
                else if (this.match(lexer_js_1.TokenType.CHOICE)) {
                    propertyName = 'choice';
                }
                else if (this.match(lexer_js_1.TokenType.SHUFFLE)) {
                    propertyName = 'shuffle';
                }
                else if (this.match(lexer_js_1.TokenType.BOOL)) {
                    propertyName = 'bool';
                }
                else if (this.match(lexer_js_1.TokenType.CONTAINS)) {
                    propertyName = 'contains';
                }
                else if (this.match(lexer_js_1.TokenType.UPPER)) {
                    propertyName = 'upper';
                }
                else if (this.match(lexer_js_1.TokenType.LOWER)) {
                    propertyName = 'lower';
                }
                else if (this.match(lexer_js_1.TokenType.TRIM)) {
                    propertyName = 'trim';
                }
                else if (this.match(lexer_js_1.TokenType.SPLIT)) {
                    propertyName = 'split';
                }
                else if (this.match(lexer_js_1.TokenType.JOIN)) {
                    propertyName = 'join';
                }
                else if (this.match(lexer_js_1.TokenType.REPLACE)) {
                    propertyName = 'replace';
                }
                else if (this.match(lexer_js_1.TokenType.SUBSTRING)) {
                    propertyName = 'substring';
                }
                else if (this.match(lexer_js_1.TokenType.STARTS_WITH)) {
                    propertyName = 'startsWith';
                }
                else if (this.match(lexer_js_1.TokenType.ENDS_WITH)) {
                    propertyName = 'endsWith';
                }
                else if (this.match(lexer_js_1.TokenType.ABS)) {
                    propertyName = 'abs';
                }
                else if (this.match(lexer_js_1.TokenType.ROUND)) {
                    propertyName = 'round';
                }
                else if (this.match(lexer_js_1.TokenType.FLOOR)) {
                    propertyName = 'floor';
                }
                else if (this.match(lexer_js_1.TokenType.CEIL)) {
                    propertyName = 'ceil';
                }
                else if (this.match(lexer_js_1.TokenType.SQRT)) {
                    propertyName = 'sqrt';
                }
                else if (this.match(lexer_js_1.TokenType.POW)) {
                    propertyName = 'pow';
                }
                else if (this.match(lexer_js_1.TokenType.MIN)) {
                    propertyName = 'min';
                }
                else if (this.match(lexer_js_1.TokenType.MAX)) {
                    propertyName = 'max';
                }
                else if (this.match(lexer_js_1.TokenType.CLAMP)) {
                    propertyName = 'clamp';
                }
                else if (this.match(lexer_js_1.TokenType.RANDOM)) {
                    propertyName = 'random';
                }
                else if (this.match(lexer_js_1.TokenType.PI)) {
                    propertyName = 'pi';
                }
                else if (this.match(lexer_js_1.TokenType.E)) {
                    propertyName = 'e';
                }
                else {
                    throw (0, errors_js_1.unexpectedToken)(this.peek(), ['property name']);
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
            }
            else {
                break;
            }
        }
        return expr;
    }
    primary() {
        // Call function expression: call name with args
        if (this.match(lexer_js_1.TokenType.CALL)) {
            const nameToken = this.consumeName(['function name']);
            const args = [];
            if (this.match(lexer_js_1.TokenType.WITH)) {
                do {
                    args.push(this.expression());
                } while (this.match(lexer_js_1.TokenType.COMMA));
            }
            return { type: 'Call', callee: { type: 'Identifier', name: nameToken.value }, args };
        }
        // Literals
        if (this.match(lexer_js_1.TokenType.STRING)) {
            return { type: 'Literal', value: this.previous().value };
        }
        if (this.match(lexer_js_1.TokenType.NUMBER)) {
            return { type: 'Literal', value: parseFloat(this.previous().value) };
        }
        if (this.match(lexer_js_1.TokenType.BOOLEAN)) {
            return { type: 'Literal', value: this.previous().value === 'true' };
        }
        // List literal
        if (this.match(lexer_js_1.TokenType.LBRACKET)) {
            const elements = [];
            // Consume newlines after the opening bracket
            this.match(lexer_js_1.TokenType.NEWLINE);
            if (!this.check(lexer_js_1.TokenType.RBRACKET)) {
                do {
                    this.consumeNewline();
                    if (this.check(lexer_js_1.TokenType.RBRACKET))
                        break;
                    elements.push(this.expression());
                    this.match(lexer_js_1.TokenType.NEWLINE); // Consume newline after element
                } while (this.match(lexer_js_1.TokenType.COMMA));
            }
            this.consume(lexer_js_1.TokenType.RBRACKET, ['"]"']);
            return { type: 'List', elements };
        }
        // Dict literal
        if (this.match(lexer_js_1.TokenType.LBRACE)) {
            const entries = [];
            this.match(lexer_js_1.TokenType.NEWLINE);
            if (!this.check(lexer_js_1.TokenType.RBRACE)) {
                do {
                    this.consumeNewline();
                    if (this.check(lexer_js_1.TokenType.RBRACE))
                        break;
                    const keyToken = this.consumeName(['key name']);
                    this.consume(lexer_js_1.TokenType.COLON, ['":"']);
                    const value = this.expression();
                    entries.push({ key: keyToken.value, value });
                    this.match(lexer_js_1.TokenType.NEWLINE);
                } while (this.match(lexer_js_1.TokenType.COMMA));
            }
            this.consume(lexer_js_1.TokenType.RBRACE, ['"}"']);
            return { type: 'Dict', entries };
        }
        // Grouping
        if (this.match(lexer_js_1.TokenType.LPAREN)) {
            const expr = this.expression();
            this.consume(lexer_js_1.TokenType.RPAREN, ['")"']);
            return expr;
        }
        // Identifier
        if (this.match(lexer_js_1.TokenType.IDENTIFIER)) {
            return { type: 'Identifier', name: this.previous().value };
        }
        // Accept any keyword as an identifier (for variables/functions named like keywords)
        const token = this.peek();
        if (token.type !== lexer_js_1.TokenType.EOF && token.type !== lexer_js_1.TokenType.NEWLINE &&
            token.type !== lexer_js_1.TokenType.COMMENT && token.value &&
            token.type !== lexer_js_1.TokenType.RPAREN && token.type !== lexer_js_1.TokenType.RBRACKET &&
            token.type !== lexer_js_1.TokenType.RBRACE && token.type !== lexer_js_1.TokenType.COMMA &&
            token.type !== lexer_js_1.TokenType.COLON && token.type !== lexer_js_1.TokenType.DOT) {
            this.advance();
            return { type: 'Identifier', name: token.value };
        }
        throw (0, errors_js_1.unexpectedToken)(this.peek(), ['expression']);
    }
    // Utility methods
    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    check(type) {
        if (this.isAtEnd())
            return type === lexer_js_1.TokenType.EOF;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === lexer_js_1.TokenType.EOF;
    }
    peek(offset = 0) {
        return this.tokens[this.current + offset];
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    consume(type, expected) {
        if (this.check(type))
            return this.advance();
        throw (0, errors_js_1.unexpectedToken)(this.peek(), expected);
    }
    // Accept identifier or keyword as a name (for variable/function names that collide with keywords)
    consumeName(expected) {
        if (this.check(lexer_js_1.TokenType.IDENTIFIER))
            return this.advance();
        // Accept any keyword token as a name
        const token = this.peek();
        if (token.type !== lexer_js_1.TokenType.EOF && token.type !== lexer_js_1.TokenType.NEWLINE &&
            token.type !== lexer_js_1.TokenType.COMMENT && token.value) {
            return this.advance();
        }
        throw (0, errors_js_1.unexpectedToken)(this.peek(), expected);
    }
    consumeNewline() {
        while (this.check(lexer_js_1.TokenType.NEWLINE))
            this.advance();
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map