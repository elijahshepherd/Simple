import { Interpreter } from './interpreter.js';
export interface StdlibFunction {
    arity: number;
    impl: (interpreter: Interpreter, args: any[]) => any;
}
export interface StdlibModule {
    functions: Record<string, StdlibFunction>;
}
export declare const stdlib: Record<string, StdlibModule>;
//# sourceMappingURL=stdlib.d.ts.map