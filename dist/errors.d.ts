import { Token } from './lexer.js';
export declare class SimpleError extends Error {
    line: number;
    column: number;
    sourceLine: string;
    suggestion?: string | undefined;
    constructor(message: string, line: number, column: number, sourceLine?: string, suggestion?: string | undefined);
    static fromToken(token: Token, message: string, suggestion?: string): SimpleError;
    toString(source?: string): string;
}
export declare function formatError(error: SimpleError, source?: string): string;
export declare function unexpectedToken(token: Token, expected: string[]): SimpleError;
export declare function undefinedIdentifier(token: Token, name: string): SimpleError;
export declare function typeMismatch(token: Token, expected: string, got: string): SimpleError;
export declare function wrongArgCount(token: Token, name: string, expected: number, got: number): SimpleError;
export declare function notCallable(token: Token, name: string): SimpleError;
export declare function divisionByZero(token: Token): SimpleError;
export declare function indexOutOfBounds(token: Token, index: number, length: number): SimpleError;
export declare function keyNotFound(token: Token, key: string): SimpleError;
export declare function fileNotFound(token: Token, path: string): SimpleError;
export declare function ioError(token: Token, operation: string, message: string): SimpleError;
//# sourceMappingURL=errors.d.ts.map