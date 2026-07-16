import { TokenType } from './lexer.js';
export type Expr = {
    type: 'Literal';
    value: string | number | boolean;
} | {
    type: 'Identifier';
    name: string;
} | {
    type: 'Binary';
    left: Expr;
    operator: TokenType;
    right: Expr;
} | {
    type: 'Unary';
    operator: TokenType;
    operand: Expr;
} | {
    type: 'Call';
    callee: Expr;
    args: Expr[];
} | {
    type: 'Index';
    object: Expr;
    index: Expr;
} | {
    type: 'Property';
    object: Expr;
    property: string;
} | {
    type: 'List';
    elements: Expr[];
} | {
    type: 'Dict';
    entries: {
        key: string;
        value: Expr;
    }[];
};
export type Stmt = {
    type: 'Say';
    expr: Expr;
    styles: string[];
} | {
    type: 'Ask';
    prompt: Expr;
    target: string;
} | {
    type: 'Remember';
    name: string;
    value: Expr;
    constant: boolean;
} | {
    type: 'If';
    condition: Expr;
    thenBranch: Stmt[];
    elseBranch: Stmt[];
} | {
    type: 'RepeatTimes';
    count: Expr;
    body: Stmt[];
} | {
    type: 'RepeatWhile';
    condition: Expr;
    body: Stmt[];
} | {
    type: 'Function';
    name: string;
    params: string[];
    body: Stmt[];
} | {
    type: 'Return';
    value?: Expr;
} | {
    type: 'Call';
    name: string;
    args: Expr[];
} | {
    type: 'Import';
    module: string;
    alias?: string;
} | {
    type: 'Wait';
    duration: Expr;
} | {
    type: 'Clear';
} | {
    type: 'Exit';
    code?: Expr;
} | {
    type: 'CreateFile';
    path: Expr;
} | {
    type: 'DeleteFile';
    path: Expr;
} | {
    type: 'WriteFile';
    path: Expr;
    content: Expr;
    append: boolean;
} | {
    type: 'ReadFile';
    path: Expr;
    target: string;
} | {
    type: 'FileExists';
    path: Expr;
    target: string;
} | {
    type: 'CopyFile';
    from: Expr;
    to: Expr;
} | {
    type: 'MoveFile';
    from: Expr;
    to: Expr;
} | {
    type: 'RenameFile';
    from: Expr;
    to: Expr;
} | {
    type: 'PathJoin';
    parts: Expr[];
    target: string;
} | {
    type: 'PathDir';
    path: Expr;
    target: string;
} | {
    type: 'PathName';
    path: Expr;
    target: string;
} | {
    type: 'PathExt';
    path: Expr;
    target: string;
} | {
    type: 'Cwd';
    target: string;
} | {
    type: 'CreateFolder';
    path: Expr;
} | {
    type: 'DeleteFolder';
    path: Expr;
} | {
    type: 'ListFolder';
    path: Expr;
    target: string;
} | {
    type: 'FolderExists';
    path: Expr;
    target: string;
} | {
    type: 'HomeDir';
    target: string;
} | {
    type: 'TempDir';
    target: string;
} | {
    type: 'Args';
    target: string;
} | {
    type: 'EnvGet';
    key: Expr;
    target: string;
} | {
    type: 'EnvSet';
    key: Expr;
    value: Expr;
} | {
    type: 'RunCommand';
    command: Expr;
    target?: string;
} | {
    type: 'Platform';
    target: string;
} | {
    type: 'Arch';
    target: string;
} | {
    type: 'RandomInt';
    min: Expr;
    max: Expr;
    target: string;
} | {
    type: 'RandomFloat';
    min: Expr;
    max: Expr;
    target: string;
} | {
    type: 'RandomChoice';
    list: Expr;
    target: string;
} | {
    type: 'RandomShuffle';
    list: Expr;
    target: string;
} | {
    type: 'RandomBool';
    target: string;
} | {
    type: 'TimeNow';
    target: string;
} | {
    type: 'TimeSleep';
    duration: Expr;
} | {
    type: 'TimeFormat';
    timestamp: Expr;
    format: Expr;
    target: string;
} | {
    type: 'TimeParse';
    str: Expr;
    format: Expr;
    target: string;
} | {
    type: 'TimeYear';
    timestamp: Expr;
    target: string;
} | {
    type: 'TimeMonth';
    timestamp: Expr;
    target: string;
} | {
    type: 'TimeDay';
    timestamp: Expr;
    target: string;
} | {
    type: 'TimeHour';
    timestamp: Expr;
    target: string;
} | {
    type: 'TimeMinute';
    timestamp: Expr;
    target: string;
} | {
    type: 'TimeSecond';
    timestamp: Expr;
    target: string;
} | {
    type: 'TimeTimestamp';
    target: string;
} | {
    type: 'TextUpper';
    text: Expr;
    target: string;
} | {
    type: 'TextLower';
    text: Expr;
    target: string;
} | {
    type: 'TextTrim';
    text: Expr;
    target: string;
} | {
    type: 'TextSplit';
    text: Expr;
    separator: Expr;
    target: string;
} | {
    type: 'TextJoin';
    list: Expr;
    separator: Expr;
    target: string;
} | {
    type: 'TextReplace';
    text: Expr;
    search: Expr;
    replace: Expr;
    target: string;
} | {
    type: 'TextLength';
    text: Expr;
    target: string;
} | {
    type: 'TextContains';
    text: Expr;
    search: Expr;
    target: string;
} | {
    type: 'TextStartsWith';
    text: Expr;
    prefix: Expr;
    target: string;
} | {
    type: 'TextEndsWith';
    text: Expr;
    suffix: Expr;
    target: string;
} | {
    type: 'TextSubstring';
    text: Expr;
    start: Expr;
    end?: Expr;
    target: string;
} | {
    type: 'MathAbs';
    value: Expr;
    target: string;
} | {
    type: 'MathRound';
    value: Expr;
    target: string;
} | {
    type: 'MathFloor';
    value: Expr;
    target: string;
} | {
    type: 'MathCeil';
    value: Expr;
    target: string;
} | {
    type: 'MathSqrt';
    value: Expr;
    target: string;
} | {
    type: 'MathPow';
    base: Expr;
    exp: Expr;
    target: string;
} | {
    type: 'MathMin';
    a: Expr;
    b: Expr;
    target: string;
} | {
    type: 'MathMax';
    a: Expr;
    b: Expr;
    target: string;
} | {
    type: 'MathClamp';
    value: Expr;
    min: Expr;
    max: Expr;
    target: string;
} | {
    type: 'MathRandom';
    target: string;
} | {
    type: 'MathPi';
    target: string;
} | {
    type: 'MathE';
    target: string;
} | {
    type: 'ListPush';
    list: Expr;
    value: Expr;
} | {
    type: 'ListPop';
    list: Expr;
    target: string;
} | {
    type: 'ListLength';
    list: Expr;
    target: string;
} | {
    type: 'ListContains';
    list: Expr;
    value: Expr;
    target: string;
} | {
    type: 'ListIndexOf';
    list: Expr;
    value: Expr;
    target: string;
} | {
    type: 'ListRemove';
    list: Expr;
    index: Expr;
} | {
    type: 'ListSlice';
    list: Expr;
    start: Expr;
    end?: Expr;
    target: string;
} | {
    type: 'ListSort';
    list: Expr;
    target: string;
} | {
    type: 'ListReverse';
    list: Expr;
    target: string;
};
export interface Program {
    statements: Stmt[];
}
export declare class Parser {
    private tokens;
    private current;
    private sourceLines;
    constructor(source: string);
    parse(): Program;
    private statement;
    private importStatement;
    private sayStatement;
    private isExpressionStart;
    private isModuleCallStart;
    private parseModuleCallArgs;
    private askStatement;
    private rememberStatement;
    private ifStatement;
    private repeatStatement;
    private functionStatement;
    private returnStatement;
    private callStatement;
    private waitStatement;
    private exitStatement;
    private createFileStatement;
    private createFolderStatement;
    private deleteFileStatement;
    private deleteFolderStatement;
    private writeFileStatement;
    private readFileStatement;
    private copyFileStatement;
    private moveFileStatement;
    private renameFileStatement;
    private fileExistsStatement;
    private pathStatement;
    private listFolderStatement;
    private folderExistsStatement;
    private argsStatement;
    private envStatement;
    private runCommandStatement;
    private platformStatement;
    private archStatement;
    private randomStatement;
    private timeStatement;
    private sleepStatement;
    private formatStatement;
    private textStatement;
    private mathStatement;
    private methodCallStatement;
    private spaceDelimMethodCall;
    private expression;
    private assignment;
    private logicalOr;
    private logicalAnd;
    private equality;
    private comparison;
    private term;
    private factor;
    private unary;
    private call;
    private primary;
    private match;
    private check;
    private advance;
    private isAtEnd;
    private peek;
    private previous;
    private consume;
    private consumeName;
    private consumeNewline;
}
//# sourceMappingURL=parser.d.ts.map