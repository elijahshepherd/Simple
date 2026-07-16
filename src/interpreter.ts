import { Program, Stmt, Expr } from './parser.js';
import { SimpleError, formatError, undefinedIdentifier, typeMismatch, wrongArgCount, notCallable, divisionByZero, indexOutOfBounds, keyNotFound, fileNotFound, ioError } from './errors.js';
import { stdlib, StdlibModule } from './stdlib.js';

export type Value = string | number | boolean | null | Value[] | Map<string, Value> | Callable;

export interface Callable {
  call: (interpreter: Interpreter, args: Value[]) => Promise<Value> | Value;
  arity: number;
  name: string;
}

export class Environment {
  private values: Map<string, Value> = new Map();
  private constants: Set<string> = new Set();
  public parent: Environment | null = null;

  define(name: string, value: Value, constant = false): void {
    if (this.values.has(name) && this.constants.has(name)) {
      throw new Error(`Cannot redefine constant "${name}"`);
    }
    this.values.set(name, value);
    if (constant) this.constants.add(name);
  }

  assign(name: string, value: Value): void {
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

  get(name: string): Value {
    if (this.values.has(name)) {
      return this.values.get(name)!;
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error(`Undefined variable "${name}"`);
  }

  getAt(name: string, distance: number): Value {
    let env: Environment = this;
    for (let i = 0; i < distance; i++) {
      env = env.parent!;
    }
    return env.values.get(name)!;
  }

  assignAt(name: string, value: Value, distance: number): void {
    let env: Environment = this;
    for (let i = 0; i < distance; i++) {
      env = env.parent!;
    }
    env.values.set(name, value);
  }

  has(name: string): boolean {
    return this.values.has(name) || (this.parent ? this.parent.has(name) : false);
  }
}

export class ReturnValue extends Error {
  constructor(public value: Value) {
    super('return');
    this.name = 'ReturnValue';
  }
}

export class Interpreter {
  public globals: Environment;
  private environment: Environment;
  private functions: Map<string, { params: string[]; body: Stmt[] }> = new Map();
  private locals: Map<Expr, number> = new Map();
  private stdlib: Record<string, StdlibModule>;
  private _currentStyles: string[] = [];

  constructor() {
    this.globals = new Environment();
    this.environment = this.globals;
    this.stdlib = stdlib;
    this.defineGlobals();
  }

  private defineGlobals(): void {
    // Register stdlib modules
    for (const [modName, mod] of Object.entries(this.stdlib)) {
      for (const [funcName, func] of Object.entries(mod.functions)) {
        const fullName = `${modName}.${funcName}`;
        this.globals.define(fullName, {
          name: fullName,
          arity: func.arity,
          call: async (interpreter: Interpreter, args: Value[]) => func.impl(interpreter, args),
        } as Callable);
      }
    }

    // Built-in 'say' handled specially with styles
    this.globals.define('say', {
      name: 'say',
      arity: 1,
      call: async (interpreter: Interpreter, args: Value[]) => {
        const styles = interpreter._currentStyles;
        interpreter._currentStyles = [];
        const text = interpreter.stringify(args[0]);
        interpreter.output(text, styles);
        return null;
      },
    } as Callable);
  }

  async interpret(program: Program): Promise<void> {
    try {
      for (const stmt of program.statements) {
        await this.execute(stmt);
      }
    } catch (error) {
      if (error instanceof SimpleError) throw error;
      throw error;
    }
  }

  private async execute(stmt: Stmt): Promise<void> {
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
        const s = stmt as any;
        if (s.type === 'Expression') {
          await this.evaluate(s.expr);
        } else {
          await this.evaluate(s);
        }
    }
  }

  private async evaluate(expr: Expr): Promise<Value> {
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
        const map = new Map<string, Value>();
        for (const entry of expr.entries) {
          map.set(entry.key, await this.evaluate(entry.value));
        }
        return map;
      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }

  private lookupVariable(name: string, expr: Expr): Value {
    if (this.locals.has(expr)) {
      const distance = this.locals.get(expr)!;
      return this.environment.getAt(name, distance);
    }
    // Check current environment and its parents
    return this.environment.get(name);
  }

  private async evaluateBinary(expr: Expr & { type: 'Binary' }): Promise<Value> {
    const left = await this.evaluate(expr.left);
    const right = await this.evaluate(expr.right);

    switch (expr.operator) {
      case 'PLUS':
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
        if (Array.isArray(left) && Array.isArray(right)) return [...left, ...right];
        throw typeMismatch({ line: 0, column: 0 } as any, 'number or string', typeof left);
      case 'MINUS':
        this.checkNumberOperands(left, right);
        return (left as number) - (right as number);
      case 'MULTIPLY':
        this.checkNumberOperands(left, right);
        return (left as number) * (right as number);
      case 'DIVIDED_BY':
        this.checkNumberOperands(left, right);
        if (right === 0) throw divisionByZero({ line: 0, column: 0 } as any);
        return (left as number) / (right as number);
      case 'MOD':
        this.checkNumberOperands(left, right);
        return (left as number) % (right as number);
      case 'IS':
        return this.isEqual(left, right);
      case 'IS_NOT':
        return !this.isEqual(left, right);
      case 'GREATER_THAN':
        this.checkNumberOperands(left, right);
        return (left as number) > (right as number);
      case 'LESS_THAN':
        this.checkNumberOperands(left, right);
        return (left as number) < (right as number);
      case 'GREATER_EQUAL':
        this.checkNumberOperands(left, right);
        return (left as number) >= (right as number);
      case 'LESS_EQUAL':
        this.checkNumberOperands(left, right);
        return (left as number) <= (right as number);
      case 'AND':
        return this.isTruthy(left) && this.isTruthy(right);
      case 'OR':
        return this.isTruthy(left) || this.isTruthy(right);
    }
    throw new Error(`Unknown operator: ${expr.operator}`);
  }

  private async evaluateUnary(expr: Expr & { type: 'Unary' }): Promise<Value> {
    const operand = await this.evaluate(expr.operand);
    switch (expr.operator) {
      case 'NOT':
        return !this.isTruthy(operand);
      case 'MINUS':
        this.checkNumberOperand(operand);
        return -(operand as number);
    }
    throw new Error(`Unknown unary operator: ${expr.operator}`);
  }

  private async evaluateCall(expr: Expr & { type: 'Call' }): Promise<Value> {
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
          const callable = func as Callable;
          if (args.length !== callable.arity) {
            throw wrongArgCount({ line: 0, column: 0 } as any, callable.name, callable.arity, args.length);
          }
          return callable.call(this, args);
        }
      } catch {
        // Fall through to normal evaluation
      }
    }

    // Special case: handle list method calls via Property (e.g., nums.contains 4)
    // When callee is Property(nums, contains), treat it as a list method call
    if (expr.callee.type === 'Property' && expr.callee.object.type === 'Identifier') {
      const objName = expr.callee.object.name;
      const methodName = expr.callee.property.toLowerCase();
      const args = await Promise.all(expr.args.map(arg => this.evaluate(arg)));
      // Look up the object (list or string)
      try {
        const obj = this.environment.get(objName);

        // Handle array methods
        if (Array.isArray(obj)) {
          if (methodName === 'contains' && args.length === 1) {
            const targetVal = args[0];
            return obj.some(v => this.isEqual(v, targetVal));
          }
          if (methodName === 'indexof' && args.length === 1) {
            const targetVal = args[0];
            const idx = obj.findIndex(v => this.isEqual(v, targetVal));
            return idx >= 0 ? idx : -1;
          }
          if (methodName === 'remove' && args.length === 1) {
            const idx = this.toNumber(args[0]);
            if (idx < 0 || idx >= obj.length) {
              throw indexOutOfBounds({ line: 0, column: 0 } as any, idx, obj.length);
            }
            return obj.splice(idx, 1)[0];
          }
          if (methodName === 'slice' && args.length >= 1) {
            const start = Math.floor(this.toNumber(args[0]));
            const end = args.length > 1 ? Math.floor(this.toNumber(args[1])) : undefined;
            return obj.slice(start, end);
          }
          if (methodName === 'sort') {
            return [...obj].sort((a, b) => {
              if (typeof a === 'number' && typeof b === 'number') return a - b;
              return String(a).localeCompare(String(b));
            });
          }
          if (methodName === 'reverse') {
            return [...obj].reverse();
          }
        }

        // Handle string methods
        if (typeof obj === 'string') {
          if (methodName === 'upper') return obj.toUpperCase();
          if (methodName === 'lower') return obj.toLowerCase();
          if (methodName === 'trim') return obj.trim();
          if (methodName === 'length') return obj.length;
          if (methodName === 'contains' && args.length === 1) return obj.includes(String(args[0]));
          if (methodName === 'startswith' && args.length === 1) return obj.startsWith(String(args[0]));
          if (methodName === 'endswith' && args.length === 1) return obj.endsWith(String(args[0]));
          if (methodName === 'split' && args.length === 1) return obj.split(String(args[0]));
          if (methodName === 'replace' && args.length === 2) return obj.replaceAll(String(args[0]), String(args[1]));
        }
      } catch (e) {
        // If variable not found, fall through to normal handler
      }
    }

    const callee = await this.evaluate(expr.callee);
    const args = await Promise.all(expr.args.map(arg => this.evaluate(arg)));

    if (typeof callee === 'function') {
      return (callee as (interpreter: Interpreter, args: Value[]) => Promise<Value> | Value)(this, args);
    }
    if (callee && typeof callee === 'object' && 'call' in callee && 'arity' in callee && 'name' in callee) {
      const callable = callee as { call: (interpreter: Interpreter, args: Value[]) => Promise<Value> | Value; arity: number; name: string };
      if (args.length !== callable.arity) {
        throw wrongArgCount({ line: 0, column: 0 } as any, callable.name, callable.arity, args.length);
      }
      return callable.call(this, args);
    }
    throw notCallable({ line: 0, column: 0 } as any, String(callee));
  }

  private async evaluateIndex(expr: Expr & { type: 'Index' }): Promise<Value> {
    const object = await this.evaluate(expr.object);
    const index = await this.evaluate(expr.index);

    if (Array.isArray(object)) {
      const idx = this.toNumber(index);
      if (idx < 0 || idx >= object.length) {
        throw indexOutOfBounds({ line: 0, column: 0 } as any, idx, object.length);
      }
      return object[idx];
    }
    if (object instanceof Map) {
      const key = String(index);
      if (!object.has(key)) {
        throw keyNotFound({ line: 0, column: 0 } as any, key);
      }
      return object.get(key)!;
    }
    throw typeMismatch({ line: 0, column: 0 } as any, 'list or dictionary', typeof object);
  }

  private async evaluateProperty(expr: Expr & { type: 'Property' }): Promise<Value> {
    const object = await this.evaluate(expr.object);
    if (object instanceof Map) {
      const value = object.get(expr.property);
      if (value === undefined) {
        throw keyNotFound({ line: 0, column: 0 } as any, expr.property);
      }
      return value;
    }
    if (Array.isArray(object)) {
      // Handle array properties like .length
      if (expr.property === 'length') {
        return object.length;
      }
      // Handle list method calls via property access (e.g., list.pop)
      if (expr.property === 'pop') {
        const popped = object.pop();
        return popped ?? null;
      }
      if (expr.property === 'contains') {
        return false; // Should be handled differently
      }
      throw keyNotFound({ line: 0, column: 0 } as any, expr.property);
    }
    throw typeMismatch({ line: 0, column: 0 } as any, 'dictionary or list', typeof object);
  }

  private checkNumberOperand(operand: Value): void {
    if (typeof operand !== 'number') {
      throw typeMismatch({ line: 0, column: 0 } as any, 'number', typeof operand);
    }
  }

  private checkNumberOperands(left: Value, right: Value): void {
    if (typeof left !== 'number' || typeof right !== 'number') {
      throw typeMismatch({ line: 0, column: 0 } as any, 'number', typeof left);
    }
  }

  private isTruthy(value: Value): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (value instanceof Map) return value.size > 0;
    return true;
  }

  private isEqual(a: Value, b: Value): boolean {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => this.isEqual(v, b[i]));
    }
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [k, v] of a) {
        if (!b.has(k) || !this.isEqual(v, b.get(k)!)) return false;
      }
      return true;
    }
    return false;
  }

  private toNumber(value: Value): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const n = parseFloat(value);
      if (isNaN(n)) throw new Error(`Cannot convert "${value}" to number`);
      return n;
    }
    throw typeMismatch({ line: 0, column: 0 } as any, 'number', typeof value);
  }

  stringify(value: Value): string {
    if (value === null) return 'nothing';
    if (value === undefined) return 'nothing';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (Array.isArray(value)) return '[' + value.map(v => this.stringify(v)).join(', ') + ']';
    if (value instanceof Map) {
      return '{' + Array.from(value.entries()).map(([k, v]) => `${k}: ${this.stringify(v)}`).join(', ') + '}';
    }
    return String(value);
  }

  private output(text: string, styles: string[]): void {
    let output = text;
    const codes: string[] = [];
    for (const style of styles) {
      switch (style) {
        case 'red': codes.push('31'); break;
        case 'green': codes.push('32'); break;
        case 'yellow': codes.push('33'); break;
        case 'blue': codes.push('34'); break;
        case 'magenta': codes.push('35'); break;
        case 'cyan': codes.push('36'); break;
        case 'white': codes.push('37'); break;
        case 'black': codes.push('30'); break;
        case 'bright': codes.push('1'); break;
        case 'bold': codes.push('1'); break;
        case 'italic': codes.push('3'); break;
        case 'underline': codes.push('4'); break;
        case 'reset': codes.push('0'); break;
        case 'bgRed': codes.push('41'); break;
        case 'bgGreen': codes.push('42'); break;
        case 'bgYellow': codes.push('43'); break;
        case 'bgBlue': codes.push('44'); break;
        case 'bgMagenta': codes.push('45'); break;
        case 'bgCyan': codes.push('46'); break;
        case 'bgWhite': codes.push('47'); break;
        case 'bgBlack': codes.push('40'); break;
      }
    }
    if (codes.length > 0) {
      output = `\x1b[${codes.join(';')}m${output}\x1b[0m`;
    }
    console.log(output);
  }

  // Statement executors
  private async executeSay(stmt: Stmt & { type: 'Say' }): Promise<void> {
    const value = await this.evaluate(stmt.expr);
    this._currentStyles = stmt.styles;
    this.output(this.stringify(value), stmt.styles);
  }

  private async executeAsk(stmt: Stmt & { type: 'Ask' }): Promise<void> {
    const prompt = this.stringify(await this.evaluate(stmt.prompt));
    const readline = await import('readline/promises');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(prompt + ' ');
    rl.close();
    this.environment.define(stmt.target, answer);
  }

  private async executeRemember(stmt: Stmt & { type: 'Remember' }): Promise<void> {
    const value = await this.evaluate(stmt.value);
    this.environment.define(stmt.name, value, stmt.constant);
  }

  private async executeIf(stmt: Stmt & { type: 'If' }): Promise<void> {
    if (this.isTruthy(await this.evaluate(stmt.condition))) {
      await this.executeBlock(stmt.thenBranch);
    } else {
      await this.executeBlock(stmt.elseBranch);
    }
  }

  private async executeRepeatTimes(stmt: Stmt & { type: 'RepeatTimes' }): Promise<void> {
    const count = Math.floor(this.toNumber(await this.evaluate(stmt.count)));
    for (let i = 0; i < count; i++) {
      await this.executeBlock(stmt.body);
    }
  }

  private async executeRepeatWhile(stmt: Stmt & { type: 'RepeatWhile' }): Promise<void> {
    while (this.isTruthy(await this.evaluate(stmt.condition))) {
      await this.executeBlock(stmt.body);
    }
  }

  private executeFunction(stmt: Stmt & { type: 'Function' }): void {
    this.functions.set(stmt.name, { params: stmt.params, body: stmt.body });
    this.globals.define(stmt.name, {
      name: stmt.name,
      arity: stmt.params.length,
      call: async (interpreter, args) => interpreter.callUserFunction(stmt.name, args),
    } as Callable);
  }

  private async executeReturn(stmt: Stmt & { type: 'Return' }): Promise<void> {
    const value = stmt.value ? await this.evaluate(stmt.value) : null;
    throw new ReturnValue(value);
  }

  private async executeCall(stmt: Stmt & { type: 'Call' }): Promise<void> {
    const func = this.globals.get(stmt.name);
    if (!(func && typeof func === 'object' && 'call' in func)) {
      throw notCallable({ line: 0, column: 0 } as any, stmt.name);
    }
    const args = await Promise.all(stmt.args.map(arg => this.evaluate(arg)));
    (func as Callable).call(this, args);
  }

  private executeImport(stmt: Stmt & { type: 'Import' }): void {
    const mod = this.stdlib[stmt.module];
    if (!mod) throw new Error(`Module "${stmt.module}" not found`);
    const alias = stmt.alias || stmt.module;
    for (const [name, fn] of Object.entries(mod.functions)) {
      const fullName = `${alias}.${name}`;
      this.globals.define(fullName, {
        name: fullName,
        arity: fn.arity,
        call: async (interpreter, args) => fn.impl(interpreter, args),
      } as Callable);
    }
  }

  private async executeWait(stmt: Stmt & { type: 'Wait' }): Promise<void> {
    const ms = this.toNumber(await this.evaluate(stmt.duration)) * 1000;
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private executeClear(): void {
    console.clear();
  }

  private async executeExit(stmt: Stmt & { type: 'Exit' }): Promise<void> {
    const code = stmt.code ? Math.floor(this.toNumber(await this.evaluate(stmt.code))) : 0;
    process.exit(code);
  }

  private async executeReadFile(stmt: Stmt & { type: 'ReadFile' }): Promise<void> {
    const content = await this.callStdlib('files', 'read', [await this.evaluate(stmt.path)]);
    this.environment.define(stmt.target, content);
  }

  private async executeFileExists(stmt: Stmt & { type: 'FileExists' }): Promise<void> {
    const exists = await this.callStdlib('files', 'exists', [await this.evaluate(stmt.path)]);
    this.environment.define(stmt.target, exists);
  }

  private async executePathJoin(stmt: Stmt & { type: 'PathJoin' }): Promise<void> {
    const parts: string[] = [];
    for (const p of stmt.parts) {
      const val = await this.evaluate(p);
      parts.push(this.stringify(val));
    }
    const result = await this.callStdlib('files', 'pathJoin', [parts.join('/')]);
    this.environment.define(stmt.target, result);
  }

  private async executePathOp(stmt: Stmt & { type: 'PathDir' | 'PathName' | 'PathExt' }, op: string): Promise<void> {
    const result = await this.callStdlib('files', `path${op.charAt(0).toUpperCase() + op.slice(1)}`, [await this.evaluate(stmt.path)]);
    this.environment.define(stmt.target, result);
  }

  private async executeCwd(stmt: Stmt & { type: 'Cwd' }): Promise<void> {
    const result = await this.callStdlib('folders', 'cwd', []);
    this.environment.define(stmt.target, result);
  }

  private async executeListFolder(stmt: Stmt & { type: 'ListFolder' }): Promise<void> {
    const result = await this.callStdlib('folders', 'list', [await this.evaluate(stmt.path)]);
    this.environment.define(stmt.target, result);
  }

  private async executeFolderExists(stmt: Stmt & { type: 'FolderExists' }): Promise<void> {
    const result = await this.callStdlib('folders', 'exists', [await this.evaluate(stmt.path)]);
    this.environment.define(stmt.target, result);
  }

  private async executeArgs(stmt: Stmt & { type: 'Args' }): Promise<void> {
    const result = await this.callStdlib('system', 'args', []);
    this.environment.define(stmt.target, result);
  }

  private async executeEnvGet(stmt: Stmt & { type: 'EnvGet' }): Promise<void> {
    const result = await this.callStdlib('system', 'envGet', [await this.evaluate(stmt.key)]);
    this.environment.define(stmt.target, result);
  }

  private async executeRunCommand(stmt: Stmt & { type: 'RunCommand' }): Promise<void> {
    const result = await this.callStdlib('system', 'run', [await this.evaluate(stmt.command)]);
    if (stmt.target) this.environment.define(stmt.target, result);
  }

  private async executeRandomInt(stmt: Stmt & { type: 'RandomInt' }): Promise<void> {
    const min = Math.floor(this.toNumber(await this.evaluate(stmt.min)));
    const max = Math.floor(this.toNumber(await this.evaluate(stmt.max)));
    const result = await this.callStdlib('random', 'int', [min, max]);
    this.environment.define(stmt.target, result);
  }

  private async executeRandomFloat(stmt: Stmt & { type: 'RandomFloat' }): Promise<void> {
    const min = this.toNumber(await this.evaluate(stmt.min));
    const max = this.toNumber(await this.evaluate(stmt.max));
    const result = await this.callStdlib('random', 'float', [min, max]);
    this.environment.define(stmt.target, result);
  }

  private async executeRandomChoice(stmt: Stmt & { type: 'RandomChoice' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    const result = await this.callStdlib('random', 'choice', [list]);
    this.environment.define(stmt.target, result);
  }

  private async executeRandomShuffle(stmt: Stmt & { type: 'RandomShuffle' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    const result = await this.callStdlib('random', 'shuffle', [list]);
    this.environment.define(stmt.target, result);
  }

  private async executeTimeNow(stmt: Stmt & { type: 'TimeNow' }): Promise<void> {
    const result = await this.callStdlib('time', 'now', []);
    this.environment.define(stmt.target, result);
  }

  private async executeTimeFormat(stmt: Stmt & { type: 'TimeFormat' }): Promise<void> {
    const timestamp = await this.evaluate(stmt.timestamp);
    const format = this.stringify(await this.evaluate(stmt.format));
    const result = await this.callStdlib('time', 'format', [timestamp, format]);
    this.environment.define(stmt.target, result);
  }

  private async executeTimeParse(stmt: Stmt & { type: 'TimeParse' }): Promise<void> {
    const str = this.stringify(await this.evaluate(stmt.str));
    const format = this.stringify(await this.evaluate(stmt.format));
    const result = await this.callStdlib('time', 'parse', [str, format]);
    this.environment.define(stmt.target, result);
  }

  private async executeTimeComponent(stmt: Stmt & { type: 'TimeYear' | 'TimeMonth' | 'TimeDay' | 'TimeHour' | 'TimeMinute' | 'TimeSecond' }, component: string): Promise<void> {
    const timestamp = await this.evaluate(stmt.timestamp);
    const result = await this.callStdlib('time', component, [timestamp]);
    this.environment.define(stmt.target, result);
  }

  private async executeTextOp(stmt: Stmt & { type: 'TextUpper' | 'TextLower' | 'TextTrim' | 'TextLength' }, op: string): Promise<void> {
    const text = this.stringify(await this.evaluate(stmt.text));
    const result = await this.callStdlib('text', op, [text]);
    this.environment.define(stmt.target, result);
  }

  private async executeTextSplit(stmt: Stmt & { type: 'TextSplit' }): Promise<void> {
    const text = this.stringify(await this.evaluate(stmt.text));
    const separator = this.stringify(await this.evaluate(stmt.separator));
    const result = await this.callStdlib('text', 'split', [text, separator]);
    this.environment.define(stmt.target, result);
  }

  private async executeTextJoin(stmt: Stmt & { type: 'TextJoin' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    const separator = this.stringify(await this.evaluate(stmt.separator));
    const result = await this.callStdlib('text', 'join', [list, separator]);
    this.environment.define(stmt.target, result);
  }

  private async executeTextReplace(stmt: Stmt & { type: 'TextReplace' }): Promise<void> {
    const text = this.stringify(await this.evaluate(stmt.text));
    const search = this.stringify(await this.evaluate(stmt.search));
    const replace = this.stringify(await this.evaluate(stmt.replace));
    const result = await this.callStdlib('text', 'replace', [text, search, replace]);
    this.environment.define(stmt.target, result);
  }

  private async executeTextContains(stmt: Stmt & { type: 'TextContains' }): Promise<void> {
    const text = this.stringify(await this.evaluate(stmt.text));
    const search = this.stringify(await this.evaluate(stmt.search));
    const result = await this.callStdlib('text', 'contains', [text, search]);
    this.environment.define(stmt.target, result);
  }

  private async executeTextStartsWith(stmt: Stmt & { type: 'TextStartsWith' }): Promise<void> {
    const text = this.stringify(await this.evaluate(stmt.text));
    const prefix = this.stringify(await this.evaluate(stmt.prefix));
    const result = await this.callStdlib('text', 'startsWith', [text, prefix]);
    this.environment.define(stmt.target, result);
  }

  private async executeTextEndsWith(stmt: Stmt & { type: 'TextEndsWith' }): Promise<void> {
    const text = this.stringify(await this.evaluate(stmt.text));
    const suffix = this.stringify(await this.evaluate(stmt.suffix));
    const result = await this.callStdlib('text', 'endsWith', [text, suffix]);
    this.environment.define(stmt.target, result);
  }

  private async executeTextSubstring(stmt: Stmt & { type: 'TextSubstring' }): Promise<void> {
    const text = this.stringify(await this.evaluate(stmt.text));
    const start = Math.floor(this.toNumber(await this.evaluate(stmt.start)));
    const end = stmt.end ? Math.floor(this.toNumber(await this.evaluate(stmt.end))) : null;
    const result = await this.callStdlib('text', 'substring', [text, start, end]);
    this.environment.define(stmt.target, result);
  }

  private async executeMathOp(stmt: Stmt & { type: 'MathAbs' | 'MathRound' | 'MathFloor' | 'MathCeil' | 'MathSqrt' }, op: string): Promise<void> {
    const value = this.toNumber(await this.evaluate(stmt.value));
    const result = await this.callStdlib('math', op, [value]);
    this.environment.define(stmt.target, result);
  }

  private async executeMathPow(stmt: Stmt & { type: 'MathPow' }): Promise<void> {
    const base = this.toNumber(await this.evaluate(stmt.base));
    const exp = this.toNumber(await this.evaluate(stmt.exp));
    const result = await this.callStdlib('math', 'pow', [base, exp]);
    this.environment.define(stmt.target, result);
  }

  private async executeMathMinMax(stmt: Stmt & { type: 'MathMin' | 'MathMax' }, op: string): Promise<void> {
    const a = this.toNumber(await this.evaluate(stmt.a));
    const b = this.toNumber(await this.evaluate(stmt.b));
    const result = await this.callStdlib('math', op, [a, b]);
    this.environment.define(stmt.target, result);
  }

  private async executeMathClamp(stmt: Stmt & { type: 'MathClamp' }): Promise<void> {
    const value = this.toNumber(await this.evaluate(stmt.value));
    const min = this.toNumber(await this.evaluate(stmt.min));
    const max = this.toNumber(await this.evaluate(stmt.max));
    const result = await this.callStdlib('math', 'clamp', [value, min, max]);
    this.environment.define(stmt.target, result);
  }

  private async executeListPush(stmt: Stmt & { type: 'ListPush' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    const value = await this.evaluate(stmt.value);
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    list.push(value);
  }

  private async executeListPop(stmt: Stmt & { type: 'ListPop' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    const result = list.pop();
    this.environment.define(stmt.target, result ?? null);
  }

  private async executeListLength(stmt: Stmt & { type: 'ListLength' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    this.environment.define(stmt.target, list.length);
  }

  private async executeListContains(stmt: Stmt & { type: 'ListContains' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    const value = await this.evaluate(stmt.value);
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    this.environment.define(stmt.target, list.some(v => this.isEqual(v, value)));
  }

  private async executeListIndexOf(stmt: Stmt & { type: 'ListIndexOf' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    const value = await this.evaluate(stmt.value);
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    const idx = list.findIndex(v => this.isEqual(v, value));
    this.environment.define(stmt.target, idx >= 0 ? idx : -1);
  }

  private async executeListRemove(stmt: Stmt & { type: 'ListRemove' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    const index = Math.floor(this.toNumber(await this.evaluate(stmt.index)));
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    if (index < 0 || index >= list.length) throw indexOutOfBounds({ line: 0, column: 0 } as any, index, list.length);
    list.splice(index, 1);
  }

  private async executeListSlice(stmt: Stmt & { type: 'ListSlice' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    const start = Math.floor(this.toNumber(await this.evaluate(stmt.start)));
    const end = stmt.end ? Math.floor(this.toNumber(await this.evaluate(stmt.end))) : undefined;
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    this.environment.define(stmt.target, list.slice(start, end));
  }

  private async executeListSort(stmt: Stmt & { type: 'ListSort' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    list.sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });
    this.environment.define(stmt.target, list);
  }

  private async executeListReverse(stmt: Stmt & { type: 'ListReverse' }): Promise<void> {
    const list = await this.evaluate(stmt.list);
    if (!Array.isArray(list)) throw typeMismatch({ line: 0, column: 0 } as any, 'list', typeof list);
    list.reverse();
    this.environment.define(stmt.target, list);
  }

  private async executeBlock(statements: Stmt[]): Promise<void> {
    for (const stmt of statements) {
      await this.execute(stmt);
    }
  }

  private async callUserFunction(name: string, args: Value[]): Promise<Value> {
    const func = this.functions.get(name);
    if (!func) throw new Error(`Function "${name}" not found`);

    const previousEnv = this.environment;
    this.environment = new Environment();
    this.environment.parent = previousEnv;

    for (let i = 0; i < func.params.length; i++) {
      this.environment.define(func.params[i], args[i]);
    }

    try {
      await this.executeBlock(func.body);
    } catch (e) {
      if (e instanceof ReturnValue) return e.value;
      throw e;
    } finally {
      this.environment = previousEnv;
    }
    return null;
  }

  private async callStdlib(module: string, func: string, args: Value[]): Promise<Value> {
    const mod = this.stdlib[module];
    if (!mod) throw new Error(`Module "${module}" not found`);
    const fn = mod.functions[func];
    if (!fn) throw new Error(`Function "${module}.${func}" not found`);
    return fn.impl(this, args);
  }
}