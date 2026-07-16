import { SimpleError, typeMismatch, wrongArgCount, notCallable, divisionByZero, indexOutOfBounds, keyNotFound } from './errors.js';
import { stdlib } from './stdlib.js';
export class Environment {
    values = new Map();
    constants = new Set();
    parent = null;
    define(name, value, constant = false) {
        if (this.values.has(name) && this.constants.has(name)) {
            throw new Error(`Cannot redefine constant "${name}"`);
        }
        this.values.set(name, value);
        if (constant)
            this.constants.add(name);
    }
    assign(name, value) {
        if (this.values.has(name)) {
            if (this.constants.has(name)) {
                throw new Error(`Cannot assign to constant "${name}"`);
            }
            this.values.set(name, value);
            return;
        }
        if (this.parent) {
            this.parent.assign(name, value);
            return;
        }
        throw new Error(`Undefined variable "${name}"`);
    }
    get(name) {
        if (this.values.has(name)) {
            return this.values.get(name);
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`Undefined variable "${name}"`);
    }
    getAt(name, distance) {
        let env = this;
        for (let i = 0; i < distance; i++) {
            env = env.parent;
        }
        return env.values.get(name);
    }
    assignAt(name, value, distance) {
        let env = this;
        for (let i = 0; i < distance; i++) {
            env = env.parent;
        }
        env.values.set(name, value);
    }
    has(name) {
        return this.values.has(name) || (this.parent ? this.parent.has(name) : false);
    }
}
export class ReturnValue extends Error {
    value;
    constructor(value) {
        super('return');
        this.value = value;
        this.name = 'ReturnValue';
    }
}
export class Interpreter {
    globals;
    environment;
    functions = new Map();
    locals = new Map();
    stdlib;
    _currentStyles = [];
    constructor() {
        this.globals = new Environment();
        this.environment = this.globals;
        this.stdlib = stdlib;
        this.defineGlobals();
    }
    defineGlobals() {
        // Register stdlib modules
        for (const [modName, mod] of Object.entries(this.stdlib)) {
            for (const [funcName, func] of Object.entries(mod.functions)) {
                const fullName = `${modName}.${funcName}`;
                this.globals.define(fullName, {
                    name: fullName,
                    arity: func.arity,
                    call: async (interpreter, args) => func.impl(interpreter, args),
                });
            }
        }
        // Built-in 'say' handled specially with styles
        this.globals.define('say', {
            name: 'say',
            arity: 1,
            call: async (interpreter, args) => {
                const styles = interpreter._currentStyles;
                interpreter._currentStyles = [];
                const text = interpreter.stringify(args[0]);
                interpreter.output(text, styles);
                return null;
            },
        });
    }
    async interpret(program) {
        try {
            for (const stmt of program.statements) {
                await this.execute(stmt);
            }
        }
        catch (error) {
            if (error instanceof SimpleError)
                throw error;
            throw error;
        }
    }
    async execute(stmt) {
        switch (stmt.type) {
            case 'Say':
                await this.executeSay(stmt);
                break;
            case 'Ask':
                await this.executeAsk(stmt);
                break;
            case 'Remember':
                await this.executeRemember(stmt);
                break;
            case 'If':
                await this.executeIf(stmt);
                break;
            case 'RepeatTimes':
                await this.executeRepeatTimes(stmt);
                break;
            case 'RepeatWhile':
                await this.executeRepeatWhile(stmt);
                break;
            case 'Function':
                await this.executeFunction(stmt);
                break;
            case 'Return':
                await this.executeReturn(stmt);
                break;
            case 'Call':
                await this.executeCall(stmt);
                break;
            case 'Import':
                await this.executeImport(stmt);
                break;
            case 'Wait':
                await this.executeWait(stmt);
                break;
            case 'Clear':
                await this.executeClear();
                break;
            case 'Exit':
                await this.executeExit(stmt);
                break;
            // File operations
            case 'CreateFile':
                await this.callStdlib('files', 'create', [await this.evaluate(stmt.path)]);
                break;
            case 'DeleteFile':
                await this.callStdlib('files', 'delete', [await this.evaluate(stmt.path)]);
                break;
            case 'WriteFile':
                await this.callStdlib('files', stmt.append ? 'append' : 'write', [await this.evaluate(stmt.path), await this.evaluate(stmt.content)]);
                break;
            case 'ReadFile':
                await this.executeReadFile(stmt);
                break;
            case 'FileExists':
                await this.executeFileExists(stmt);
                break;
            case 'CopyFile':
                await this.callStdlib('files', 'copy', [await this.evaluate(stmt.from), await this.evaluate(stmt.to)]);
                break;
            case 'MoveFile':
                await this.callStdlib('files', 'move', [await this.evaluate(stmt.from), await this.evaluate(stmt.to)]);
                break;
            case 'RenameFile':
                await this.callStdlib('files', 'rename', [await this.evaluate(stmt.from), await this.evaluate(stmt.to)]);
                break;
            case 'PathJoin':
                await this.executePathJoin(stmt);
                break;
            case 'PathDir':
                await this.executePathOp(stmt, 'dir');
                break;
            case 'PathName':
                await this.executePathOp(stmt, 'name');
                break;
            case 'PathExt':
                await this.executePathOp(stmt, 'ext');
                break;
            case 'Cwd':
                await this.executeCwd(stmt);
                break;
            // Folder operations
            case 'CreateFolder':
                await this.callStdlib('folders', 'create', [await this.evaluate(stmt.path)]);
                break;
            case 'DeleteFolder':
                await this.callStdlib('folders', 'delete', [await this.evaluate(stmt.path)]);
                break;
            case 'ListFolder':
                await this.executeListFolder(stmt);
                break;
            case 'FolderExists':
                await this.executeFolderExists(stmt);
                break;
            case 'HomeDir':
                await this.callStdlib('folders', 'home', []);
                break;
            case 'TempDir':
                await this.callStdlib('folders', 'temp', []);
                break;
            // System
            case 'Args':
                await this.executeArgs(stmt);
                break;
            case 'EnvGet':
                await this.executeEnvGet(stmt);
                break;
            case 'EnvSet':
                await this.callStdlib('system', 'envSet', [await this.evaluate(stmt.key), await this.evaluate(stmt.value)]);
                break;
            case 'RunCommand':
                await this.executeRunCommand(stmt);
                break;
            case 'Platform':
                await this.callStdlib('system', 'platform', []);
                break;
            case 'Arch':
                await this.callStdlib('system', 'arch', []);
                break;
            // Random
            case 'RandomInt':
                await this.executeRandomInt(stmt);
                break;
            case 'RandomFloat':
                await this.executeRandomFloat(stmt);
                break;
            case 'RandomChoice':
                await this.executeRandomChoice(stmt);
                break;
            case 'RandomShuffle':
                await this.executeRandomShuffle(stmt);
                break;
            case 'RandomBool':
                await this.callStdlib('random', 'bool', []);
                break;
            // Time
            case 'TimeNow':
                await this.executeTimeNow(stmt);
                break;
            case 'TimeSleep':
                await this.callStdlib('time', 'sleep', [await this.evaluate(stmt.duration)]);
                break;
            case 'TimeFormat':
                await this.executeTimeFormat(stmt);
                break;
            case 'TimeParse':
                await this.executeTimeParse(stmt);
                break;
            case 'TimeYear':
                await this.executeTimeComponent(stmt, 'year');
                break;
            case 'TimeMonth':
                await this.executeTimeComponent(stmt, 'month');
                break;
            case 'TimeDay':
                await this.executeTimeComponent(stmt, 'day');
                break;
            case 'TimeHour':
                await this.executeTimeComponent(stmt, 'hour');
                break;
            case 'TimeMinute':
                await this.executeTimeComponent(stmt, 'minute');
                break;
            case 'TimeSecond':
                await this.executeTimeComponent(stmt, 'second');
                break;
            case 'TimeTimestamp':
                await this.callStdlib('time', 'timestamp', []);
                break;
            // Text
            case 'TextUpper':
                await this.executeTextOp(stmt, 'upper');
                break;
            case 'TextLower':
                await this.executeTextOp(stmt, 'lower');
                break;
            case 'TextTrim':
                await this.executeTextOp(stmt, 'trim');
                break;
            case 'TextSplit':
                await this.executeTextSplit(stmt);
                break;
            case 'TextJoin':
                await this.executeTextJoin(stmt);
                break;
            case 'TextReplace':
                await this.executeTextReplace(stmt);
                break;
            case 'TextLength':
                await this.executeTextOp(stmt, 'length');
                break;
            case 'TextContains':
                await this.executeTextContains(stmt);
                break;
            case 'TextStartsWith':
                await this.executeTextStartsWith(stmt);
                break;
            case 'TextEndsWith':
                await this.executeTextEndsWith(stmt);
                break;
            case 'TextSubstring':
                await this.executeTextSubstring(stmt);
                break;
            // Math
            case 'MathAbs':
                await this.executeMathOp(stmt, 'abs');
                break;
            case 'MathRound':
                await this.executeMathOp(stmt, 'round');
                break;
            case 'MathFloor':
                await this.executeMathOp(stmt, 'floor');
                break;
            case 'MathCeil':
                await this.executeMathOp(stmt, 'ceil');
                break;
            case 'MathSqrt':
                await this.executeMathOp(stmt, 'sqrt');
                break;
            case 'MathPow':
                await this.executeMathPow(stmt);
                break;
            case 'MathMin':
                await this.executeMathMinMax(stmt, 'min');
                break;
            case 'MathMax':
                await this.executeMathMinMax(stmt, 'max');
                break;
            case 'MathClamp':
                await this.executeMathClamp(stmt);
                break;
            case 'MathRandom':
                await this.callStdlib('math', 'random', []);
                break;
            case 'MathPi':
                await this.callStdlib('math', 'pi', []);
                break;
            case 'MathE':
                await this.callStdlib('math', 'e', []);
                break;
            // List ops
            case 'ListPush':
                await this.executeListPush(stmt);
                break;
            case 'ListPop':
                await this.executeListPop(stmt);
                break;
            case 'ListLength':
                await this.executeListLength(stmt);
                break;
            case 'ListContains':
                await this.executeListContains(stmt);
                break;
            case 'ListIndexOf':
                await this.executeListIndexOf(stmt);
                break;
            case 'ListRemove':
                await this.executeListRemove(stmt);
                break;
            case 'ListSlice':
                await this.executeListSlice(stmt);
                break;
            case 'ListSort':
                await this.executeListSort(stmt);
                break;
            case 'ListReverse':
                await this.executeListReverse(stmt);
                break;
            default:
                // Expression statement
                const s = stmt;
                if (s.type === 'Expression') {
                    await this.evaluate(s.expr);
                }
                else {
                    await this.evaluate(s);
                }
        }
    }
    async evaluate(expr) {
        switch (expr.type) {
            case 'Literal':
                return expr.value;
            case 'Identifier':
                return this.lookupVariable(expr.name, expr);
            case 'Binary':
                return this.evaluateBinary(expr);
            case 'Unary':
                return this.evaluateUnary(expr);
            case 'Call':
                return this.evaluateCall(expr);
            case 'Index':
                return this.evaluateIndex(expr);
            case 'Property':
                return this.evaluateProperty(expr);
            case 'List':
                return Promise.all(expr.elements.map(e => this.evaluate(e)));
            case 'Dict':
                const map = new Map();
                for (const entry of expr.entries) {
                    map.set(entry.key, await this.evaluate(entry.value));
                }
                return map;
            default:
                throw new Error(`Unknown expression type: ${expr.type}`);
        }
    }
    lookupVariable(name, expr) {
        if (this.locals.has(expr)) {
            const distance = this.locals.get(expr);
            return this.environment.getAt(name, distance);
        }
        // Check current environment and its parents
        return this.environment.get(name);
    }
    async evaluateBinary(expr) {
        const left = await this.evaluate(expr.left);
        const right = await this.evaluate(expr.right);
        switch (expr.operator) {
            case 'PLUS':
                if (typeof left === 'number' && typeof right === 'number')
                    return left + right;
                if (typeof left === 'string' || typeof right === 'string')
                    return String(left) + String(right);
                if (Array.isArray(left) && Array.isArray(right))
                    return [...left, ...right];
                throw typeMismatch({ line: 0, column: 0 }, 'number or string', typeof left);
            case 'MINUS':
                this.checkNumberOperands(left, right);
                return left - right;
            case 'MULTIPLY':
                this.checkNumberOperands(left, right);
                return left * right;
            case 'DIVIDED_BY':
                this.checkNumberOperands(left, right);
                if (right === 0)
                    throw divisionByZero({ line: 0, column: 0 });
                return left / right;
            case 'MOD':
                this.checkNumberOperands(left, right);
                return left % right;
            case 'IS':
                return this.isEqual(left, right);
            case 'IS_NOT':
                return !this.isEqual(left, right);
            case 'GREATER_THAN':
                this.checkNumberOperands(left, right);
                return left > right;
            case 'LESS_THAN':
                this.checkNumberOperands(left, right);
                return left < right;
            case 'GREATER_EQUAL':
                this.checkNumberOperands(left, right);
                return left >= right;
            case 'LESS_EQUAL':
                this.checkNumberOperands(left, right);
                return left <= right;
            case 'AND':
                return this.isTruthy(left) && this.isTruthy(right);
            case 'OR':
                return this.isTruthy(left) || this.isTruthy(right);
        }
        throw new Error(`Unknown operator: ${expr.operator}`);
    }
    async evaluateUnary(expr) {
        const operand = await this.evaluate(expr.operand);
        switch (expr.operator) {
            case 'NOT':
                return !this.isTruthy(operand);
            case 'MINUS':
                this.checkNumberOperand(operand);
                return -operand;
        }
        throw new Error(`Unknown unary operator: ${expr.operator}`);
    }
    async evaluateCall(expr) {
        // Special case: handle module-style calls like random.int(1, 100)
        // where the callee is Property with Identifier object
        if (expr.callee.type === 'Property' && expr.callee.object.type === 'Identifier') {
            const moduleName = expr.callee.object.name.toLowerCase();
            const methodName = expr.callee.property.toLowerCase();
            const fullName = `${moduleName}.${methodName}`;
            try {
                const func = this.globals.get(fullName);
                if (func && typeof func === 'object' && 'call' in func) {
                    const args = await Promise.all(expr.args.map(arg => this.evaluate(arg)));
                    const callable = func;
                    if (args.length !== callable.arity) {
                        throw wrongArgCount({ line: 0, column: 0 }, callable.name, callable.arity, args.length);
                    }
                    return callable.call(this, args);
                }
            }
            catch {
                // Fall through to normal evaluation
            }
        }
        const callee = await this.evaluate(expr.callee);
        const args = await Promise.all(expr.args.map(arg => this.evaluate(arg)));
        if (typeof callee === 'function') {
            return callee(this, args);
        }
        if (callee && typeof callee === 'object' && 'call' in callee && 'arity' in callee && 'name' in callee) {
            const callable = callee;
            if (args.length !== callable.arity) {
                throw wrongArgCount({ line: 0, column: 0 }, callable.name, callable.arity, args.length);
            }
            return callable.call(this, args);
        }
        throw notCallable({ line: 0, column: 0 }, String(callee));
    }
    async evaluateIndex(expr) {
        const object = await this.evaluate(expr.object);
        const index = await this.evaluate(expr.index);
        if (Array.isArray(object)) {
            const idx = this.toNumber(index);
            if (idx < 0 || idx >= object.length) {
                throw indexOutOfBounds({ line: 0, column: 0 }, idx, object.length);
            }
            return object[idx];
        }
        if (object instanceof Map) {
            const key = String(index);
            if (!object.has(key)) {
                throw keyNotFound({ line: 0, column: 0 }, key);
            }
            return object.get(key);
        }
        throw typeMismatch({ line: 0, column: 0 }, 'list or dictionary', typeof object);
    }
    async evaluateProperty(expr) {
        const object = await this.evaluate(expr.object);
        if (object instanceof Map) {
            const value = object.get(expr.property);
            if (value === undefined) {
                throw keyNotFound({ line: 0, column: 0 }, expr.property);
            }
            return value;
        }
        if (Array.isArray(object)) {
            // Handle array properties like .length
            if (expr.property === 'length') {
                return object.length;
            }
            throw keyNotFound({ line: 0, column: 0 }, expr.property);
        }
        throw typeMismatch({ line: 0, column: 0 }, 'dictionary or list', typeof object);
    }
    checkNumberOperand(operand) {
        if (typeof operand !== 'number') {
            throw typeMismatch({ line: 0, column: 0 }, 'number', typeof operand);
        }
    }
    checkNumberOperands(left, right) {
        if (typeof left !== 'number' || typeof right !== 'number') {
            throw typeMismatch({ line: 0, column: 0 }, 'number', typeof left);
        }
    }
    isTruthy(value) {
        if (value === null || value === undefined)
            return false;
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'number')
            return value !== 0;
        if (typeof value === 'string')
            return value.length > 0;
        if (Array.isArray(value))
            return value.length > 0;
        if (value instanceof Map)
            return value.size > 0;
        return true;
    }
    isEqual(a, b) {
        if (a === b)
            return true;
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length)
                return false;
            return a.every((v, i) => this.isEqual(v, b[i]));
        }
        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size)
                return false;
            for (const [k, v] of a) {
                if (!b.has(k) || !this.isEqual(v, b.get(k)))
                    return false;
            }
            return true;
        }
        return false;
    }
    toNumber(value) {
        if (typeof value === 'number')
            return value;
        if (typeof value === 'string') {
            const n = parseFloat(value);
            if (isNaN(n))
                throw new Error(`Cannot convert "${value}" to number`);
            return n;
        }
        throw typeMismatch({ line: 0, column: 0 }, 'number', typeof value);
    }
    stringify(value) {
        if (value === null)
            return 'nothing';
        if (value === undefined)
            return 'nothing';
        if (typeof value === 'boolean')
            return value ? 'true' : 'false';
        if (typeof value === 'string')
            return value;
        if (typeof value === 'number')
            return String(value);
        if (Array.isArray(value))
            return '[' + value.map(v => this.stringify(v)).join(', ') + ']';
        if (value instanceof Map) {
            return '{' + Array.from(value.entries()).map(([k, v]) => `${k}: ${this.stringify(v)}`).join(', ') + '}';
        }
        return String(value);
    }
    output(text, styles) {
        let output = text;
        const codes = [];
        for (const style of styles) {
            switch (style) {
                case 'red':
                    codes.push('31');
                    break;
                case 'green':
                    codes.push('32');
                    break;
                case 'yellow':
                    codes.push('33');
                    break;
                case 'blue':
                    codes.push('34');
                    break;
                case 'magenta':
                    codes.push('35');
                    break;
                case 'cyan':
                    codes.push('36');
                    break;
                case 'white':
                    codes.push('37');
                    break;
                case 'black':
                    codes.push('30');
                    break;
                case 'bright':
                    codes.push('1');
                    break;
                case 'bold':
                    codes.push('1');
                    break;
                case 'italic':
                    codes.push('3');
                    break;
                case 'underline':
                    codes.push('4');
                    break;
                case 'reset':
                    codes.push('0');
                    break;
                case 'bgRed':
                    codes.push('41');
                    break;
                case 'bgGreen':
                    codes.push('42');
                    break;
                case 'bgYellow':
                    codes.push('43');
                    break;
                case 'bgBlue':
                    codes.push('44');
                    break;
                case 'bgMagenta':
                    codes.push('45');
                    break;
                case 'bgCyan':
                    codes.push('46');
                    break;
                case 'bgWhite':
                    codes.push('47');
                    break;
                case 'bgBlack':
                    codes.push('40');
                    break;
            }
        }
        if (codes.length > 0) {
            output = `\x1b[${codes.join(';')}m${output}\x1b[0m`;
        }
        console.log(output);
    }
    // Statement executors
    async executeSay(stmt) {
        const value = await this.evaluate(stmt.expr);
        this._currentStyles = stmt.styles;
        this.output(this.stringify(value), stmt.styles);
    }
    async executeAsk(stmt) {
        const prompt = this.stringify(await this.evaluate(stmt.prompt));
        const readline = await import('readline/promises');
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const answer = await rl.question(prompt + ' ');
        rl.close();
        this.environment.define(stmt.target, answer);
    }
    async executeRemember(stmt) {
        const value = await this.evaluate(stmt.value);
        this.environment.define(stmt.name, value, stmt.constant);
    }
    async executeIf(stmt) {
        if (this.isTruthy(await this.evaluate(stmt.condition))) {
            await this.executeBlock(stmt.thenBranch);
        }
        else {
            await this.executeBlock(stmt.elseBranch);
        }
    }
    async executeRepeatTimes(stmt) {
        const count = Math.floor(this.toNumber(await this.evaluate(stmt.count)));
        for (let i = 0; i < count; i++) {
            await this.executeBlock(stmt.body);
        }
    }
    async executeRepeatWhile(stmt) {
        while (this.isTruthy(await this.evaluate(stmt.condition))) {
            await this.executeBlock(stmt.body);
        }
    }
    executeFunction(stmt) {
        this.functions.set(stmt.name, { params: stmt.params, body: stmt.body });
        this.globals.define(stmt.name, {
            name: stmt.name,
            arity: stmt.params.length,
            call: async (interpreter, args) => interpreter.callUserFunction(stmt.name, args),
        });
    }
    async executeReturn(stmt) {
        const value = stmt.value ? await this.evaluate(stmt.value) : null;
        throw new ReturnValue(value);
    }
    async executeCall(stmt) {
        const func = this.globals.get(stmt.name);
        if (!(func && typeof func === 'object' && 'call' in func)) {
            throw notCallable({ line: 0, column: 0 }, stmt.name);
        }
        const args = await Promise.all(stmt.args.map(arg => this.evaluate(arg)));
        func.call(this, args);
    }
    executeImport(stmt) {
        const mod = this.stdlib[stmt.module];
        if (!mod)
            throw new Error(`Module "${stmt.module}" not found`);
        const alias = stmt.alias || stmt.module;
        for (const [name, fn] of Object.entries(mod.functions)) {
            const fullName = `${alias}.${name}`;
            this.globals.define(fullName, {
                name: fullName,
                arity: fn.arity,
                call: async (interpreter, args) => fn.impl(interpreter, args),
            });
        }
    }
    async executeWait(stmt) {
        const ms = this.toNumber(await this.evaluate(stmt.duration)) * 1000;
        await new Promise(resolve => setTimeout(resolve, ms));
    }
    executeClear() {
        console.clear();
    }
    async executeExit(stmt) {
        const code = stmt.code ? Math.floor(this.toNumber(await this.evaluate(stmt.code))) : 0;
        process.exit(code);
    }
    async executeReadFile(stmt) {
        const content = await this.callStdlib('files', 'read', [await this.evaluate(stmt.path)]);
        this.environment.define(stmt.target, content);
    }
    async executeFileExists(stmt) {
        const exists = await this.callStdlib('files', 'exists', [await this.evaluate(stmt.path)]);
        this.environment.define(stmt.target, exists);
    }
    async executePathJoin(stmt) {
        const parts = [];
        for (const p of stmt.parts) {
            const val = await this.evaluate(p);
            parts.push(this.stringify(val));
        }
        const result = await this.callStdlib('files', 'pathJoin', [parts.join('/')]);
        this.environment.define(stmt.target, result);
    }
    async executePathOp(stmt, op) {
        const result = await this.callStdlib('files', `path${op.charAt(0).toUpperCase() + op.slice(1)}`, [await this.evaluate(stmt.path)]);
        this.environment.define(stmt.target, result);
    }
    async executeCwd(stmt) {
        const result = await this.callStdlib('folders', 'cwd', []);
        this.environment.define(stmt.target, result);
    }
    async executeListFolder(stmt) {
        const result = await this.callStdlib('folders', 'list', [await this.evaluate(stmt.path)]);
        this.environment.define(stmt.target, result);
    }
    async executeFolderExists(stmt) {
        const result = await this.callStdlib('folders', 'exists', [await this.evaluate(stmt.path)]);
        this.environment.define(stmt.target, result);
    }
    async executeArgs(stmt) {
        const result = await this.callStdlib('system', 'args', []);
        this.environment.define(stmt.target, result);
    }
    async executeEnvGet(stmt) {
        const result = await this.callStdlib('system', 'envGet', [await this.evaluate(stmt.key)]);
        this.environment.define(stmt.target, result);
    }
    async executeRunCommand(stmt) {
        const result = await this.callStdlib('system', 'run', [await this.evaluate(stmt.command)]);
        if (stmt.target)
            this.environment.define(stmt.target, result);
    }
    async executeRandomInt(stmt) {
        const min = Math.floor(this.toNumber(await this.evaluate(stmt.min)));
        const max = Math.floor(this.toNumber(await this.evaluate(stmt.max)));
        const result = await this.callStdlib('random', 'int', [min, max]);
        this.environment.define(stmt.target, result);
    }
    async executeRandomFloat(stmt) {
        const min = this.toNumber(await this.evaluate(stmt.min));
        const max = this.toNumber(await this.evaluate(stmt.max));
        const result = await this.callStdlib('random', 'float', [min, max]);
        this.environment.define(stmt.target, result);
    }
    async executeRandomChoice(stmt) {
        const list = await this.evaluate(stmt.list);
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        const result = await this.callStdlib('random', 'choice', [list]);
        this.environment.define(stmt.target, result);
    }
    async executeRandomShuffle(stmt) {
        const list = await this.evaluate(stmt.list);
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        const result = await this.callStdlib('random', 'shuffle', [list]);
        this.environment.define(stmt.target, result);
    }
    async executeTimeNow(stmt) {
        const result = await this.callStdlib('time', 'now', []);
        this.environment.define(stmt.target, result);
    }
    async executeTimeFormat(stmt) {
        const timestamp = await this.evaluate(stmt.timestamp);
        const format = this.stringify(await this.evaluate(stmt.format));
        const result = await this.callStdlib('time', 'format', [timestamp, format]);
        this.environment.define(stmt.target, result);
    }
    async executeTimeParse(stmt) {
        const str = this.stringify(await this.evaluate(stmt.str));
        const format = this.stringify(await this.evaluate(stmt.format));
        const result = await this.callStdlib('time', 'parse', [str, format]);
        this.environment.define(stmt.target, result);
    }
    async executeTimeComponent(stmt, component) {
        const timestamp = await this.evaluate(stmt.timestamp);
        const result = await this.callStdlib('time', component, [timestamp]);
        this.environment.define(stmt.target, result);
    }
    async executeTextOp(stmt, op) {
        const text = this.stringify(await this.evaluate(stmt.text));
        const result = await this.callStdlib('text', op, [text]);
        this.environment.define(stmt.target, result);
    }
    async executeTextSplit(stmt) {
        const text = this.stringify(await this.evaluate(stmt.text));
        const separator = this.stringify(await this.evaluate(stmt.separator));
        const result = await this.callStdlib('text', 'split', [text, separator]);
        this.environment.define(stmt.target, result);
    }
    async executeTextJoin(stmt) {
        const list = await this.evaluate(stmt.list);
        const separator = this.stringify(await this.evaluate(stmt.separator));
        const result = await this.callStdlib('text', 'join', [list, separator]);
        this.environment.define(stmt.target, result);
    }
    async executeTextReplace(stmt) {
        const text = this.stringify(await this.evaluate(stmt.text));
        const search = this.stringify(await this.evaluate(stmt.search));
        const replace = this.stringify(await this.evaluate(stmt.replace));
        const result = await this.callStdlib('text', 'replace', [text, search, replace]);
        this.environment.define(stmt.target, result);
    }
    async executeTextContains(stmt) {
        const text = this.stringify(await this.evaluate(stmt.text));
        const search = this.stringify(await this.evaluate(stmt.search));
        const result = await this.callStdlib('text', 'contains', [text, search]);
        this.environment.define(stmt.target, result);
    }
    async executeTextStartsWith(stmt) {
        const text = this.stringify(await this.evaluate(stmt.text));
        const prefix = this.stringify(await this.evaluate(stmt.prefix));
        const result = await this.callStdlib('text', 'startsWith', [text, prefix]);
        this.environment.define(stmt.target, result);
    }
    async executeTextEndsWith(stmt) {
        const text = this.stringify(await this.evaluate(stmt.text));
        const suffix = this.stringify(await this.evaluate(stmt.suffix));
        const result = await this.callStdlib('text', 'endsWith', [text, suffix]);
        this.environment.define(stmt.target, result);
    }
    async executeTextSubstring(stmt) {
        const text = this.stringify(await this.evaluate(stmt.text));
        const start = Math.floor(this.toNumber(await this.evaluate(stmt.start)));
        const end = stmt.end ? Math.floor(this.toNumber(await this.evaluate(stmt.end))) : null;
        const result = await this.callStdlib('text', 'substring', [text, start, end]);
        this.environment.define(stmt.target, result);
    }
    async executeMathOp(stmt, op) {
        const value = this.toNumber(await this.evaluate(stmt.value));
        const result = await this.callStdlib('math', op, [value]);
        this.environment.define(stmt.target, result);
    }
    async executeMathPow(stmt) {
        const base = this.toNumber(await this.evaluate(stmt.base));
        const exp = this.toNumber(await this.evaluate(stmt.exp));
        const result = await this.callStdlib('math', 'pow', [base, exp]);
        this.environment.define(stmt.target, result);
    }
    async executeMathMinMax(stmt, op) {
        const a = this.toNumber(await this.evaluate(stmt.a));
        const b = this.toNumber(await this.evaluate(stmt.b));
        const result = await this.callStdlib('math', op, [a, b]);
        this.environment.define(stmt.target, result);
    }
    async executeMathClamp(stmt) {
        const value = this.toNumber(await this.evaluate(stmt.value));
        const min = this.toNumber(await this.evaluate(stmt.min));
        const max = this.toNumber(await this.evaluate(stmt.max));
        const result = await this.callStdlib('math', 'clamp', [value, min, max]);
        this.environment.define(stmt.target, result);
    }
    async executeListPush(stmt) {
        const list = await this.evaluate(stmt.list);
        const value = await this.evaluate(stmt.value);
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        list.push(value);
    }
    async executeListPop(stmt) {
        const list = await this.evaluate(stmt.list);
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        const result = list.pop();
        this.environment.define(stmt.target, result ?? null);
    }
    async executeListLength(stmt) {
        const list = await this.evaluate(stmt.list);
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        this.environment.define(stmt.target, list.length);
    }
    async executeListContains(stmt) {
        const list = await this.evaluate(stmt.list);
        const value = await this.evaluate(stmt.value);
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        this.environment.define(stmt.target, list.some(v => this.isEqual(v, value)));
    }
    async executeListIndexOf(stmt) {
        const list = await this.evaluate(stmt.list);
        const value = await this.evaluate(stmt.value);
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        const idx = list.findIndex(v => this.isEqual(v, value));
        this.environment.define(stmt.target, idx >= 0 ? idx : -1);
    }
    async executeListRemove(stmt) {
        const list = await this.evaluate(stmt.list);
        const index = Math.floor(this.toNumber(await this.evaluate(stmt.index)));
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        if (index < 0 || index >= list.length)
            throw indexOutOfBounds({ line: 0, column: 0 }, index, list.length);
        list.splice(index, 1);
    }
    async executeListSlice(stmt) {
        const list = await this.evaluate(stmt.list);
        const start = Math.floor(this.toNumber(await this.evaluate(stmt.start)));
        const end = stmt.end ? Math.floor(this.toNumber(await this.evaluate(stmt.end))) : undefined;
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        this.environment.define(stmt.target, list.slice(start, end));
    }
    async executeListSort(stmt) {
        const list = await this.evaluate(stmt.list);
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        list.sort((a, b) => {
            if (typeof a === 'number' && typeof b === 'number')
                return a - b;
            return String(a).localeCompare(String(b));
        });
        this.environment.define(stmt.target, list);
    }
    async executeListReverse(stmt) {
        const list = await this.evaluate(stmt.list);
        if (!Array.isArray(list))
            throw typeMismatch({ line: 0, column: 0 }, 'list', typeof list);
        list.reverse();
        this.environment.define(stmt.target, list);
    }
    async executeBlock(statements) {
        for (const stmt of statements) {
            await this.execute(stmt);
        }
    }
    async callUserFunction(name, args) {
        const func = this.functions.get(name);
        if (!func)
            throw new Error(`Function "${name}" not found`);
        const previousEnv = this.environment;
        this.environment = new Environment();
        this.environment.parent = previousEnv;
        for (let i = 0; i < func.params.length; i++) {
            this.environment.define(func.params[i], args[i]);
        }
        try {
            await this.executeBlock(func.body);
        }
        catch (e) {
            if (e instanceof ReturnValue)
                return e.value;
            throw e;
        }
        finally {
            this.environment = previousEnv;
        }
        return null;
    }
    async callStdlib(module, func, args) {
        const mod = this.stdlib[module];
        if (!mod)
            throw new Error(`Module "${module}" not found`);
        const fn = mod.functions[func];
        if (!fn)
            throw new Error(`Function "${module}.${func}" not found`);
        return fn.impl(this, args);
    }
}
//# sourceMappingURL=interpreter.js.map