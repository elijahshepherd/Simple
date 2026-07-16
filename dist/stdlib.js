"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stdlib = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const consoleModule = {
    functions: {
        say: { arity: 1, impl: (_i, args) => { console.log(args[0]); return null; } },
        ask: { arity: 1, impl: async (_i, args) => {
                const readline = await Promise.resolve().then(() => __importStar(require('readline/promises')));
                const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
                const answer = await rl.question(String(args[0]));
                rl.close();
                return answer;
            } },
        clear: { arity: 0, impl: () => { console.clear(); return null; } },
        // Colors handled by interpreter
    },
};
const filesModule = {
    functions: {
        create: { arity: 1, impl: (_i, args) => { fs_1.default.writeFileSync(String(args[0]), ''); return true; } },
        delete: { arity: 1, impl: (_i, args) => {
                const p = String(args[0]);
                if (fs_1.default.existsSync(p)) {
                    fs_1.default.unlinkSync(p);
                    return true;
                }
                return false;
            } },
        write: { arity: 2, impl: (_i, args) => { fs_1.default.writeFileSync(String(args[0]), String(args[1])); return true; } },
        append: { arity: 2, impl: (_i, args) => { fs_1.default.appendFileSync(String(args[0]), String(args[1])); return true; } },
        read: { arity: 1, impl: (_i, args) => {
                const p = String(args[0]);
                if (!fs_1.default.existsSync(p))
                    throw new Error(`File not found: ${p}`);
                return fs_1.default.readFileSync(p, 'utf8');
            } },
        exists: { arity: 1, impl: (_i, args) => fs_1.default.existsSync(String(args[0])) },
        copy: { arity: 2, impl: (_i, args) => { fs_1.default.copyFileSync(String(args[0]), String(args[1])); return true; } },
        move: { arity: 2, impl: (_i, args) => { fs_1.default.renameSync(String(args[0]), String(args[1])); return true; } },
        rename: { arity: 2, impl: (_i, args) => { fs_1.default.renameSync(String(args[0]), String(args[1])); return true; } },
        dir: { arity: 1, impl: (_i, args) => path_1.default.dirname(String(args[0])) },
        name: { arity: 1, impl: (_i, args) => path_1.default.basename(String(args[0])) },
        ext: { arity: 1, impl: (_i, args) => path_1.default.extname(String(args[0])) },
        join: { arity: -1, impl: (_i, args) => path_1.default.join(...args.map(String)) },
        cwd: { arity: 0, impl: () => process.cwd() },
    },
};
const foldersModule = {
    functions: {
        create: { arity: 1, impl: (_i, args) => { fs_1.default.mkdirSync(String(args[0]), { recursive: true }); return true; } },
        delete: { arity: 1, impl: (_i, args) => {
                const p = String(args[0]);
                if (fs_1.default.existsSync(p)) {
                    fs_1.default.rmSync(p, { recursive: true });
                    return true;
                }
                return false;
            } },
        list: { arity: 1, impl: (_i, args) => {
                const p = String(args[0]);
                if (!fs_1.default.existsSync(p))
                    return [];
                return fs_1.default.readdirSync(p);
            } },
        exists: { arity: 1, impl: (_i, args) => fs_1.default.existsSync(String(args[0])) },
        cwd: { arity: 0, impl: () => process.cwd() },
        home: { arity: 0, impl: () => os_1.default.homedir() },
        temp: { arity: 0, impl: () => os_1.default.tmpdir() },
    },
};
const systemModule = {
    functions: {
        args: { arity: 0, impl: () => process.argv.slice(2) },
        exit: { arity: 1, impl: (_i, args) => { process.exit(Number(args[0]) || 0); } },
        envGet: { arity: 1, impl: (_i, args) => process.env[String(args[0])] ?? null },
        envSet: { arity: 2, impl: (_i, args) => { process.env[String(args[0])] = String(args[1]); return true; } },
        run: { arity: 1, impl: async (_i, args) => {
                const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
                try {
                    return execSync(String(args[0]), { encoding: 'utf8', stdio: 'pipe' }).trim();
                }
                catch (e) {
                    return e.stdout?.toString().trim() || e.message;
                }
            } },
        sleep: { arity: 1, impl: async (_i, args) => { await new Promise(r => setTimeout(r, Number(args[0]))); return null; } },
        platform: { arity: 0, impl: () => process.platform },
        arch: { arity: 0, impl: () => process.arch },
    },
};
const randomModule = {
    functions: {
        int: { arity: 2, impl: (_i, args) => Math.floor(Math.random() * (Number(args[1]) - Number(args[0]) + 1)) + Number(args[0]) },
        float: { arity: 2, impl: (_i, args) => Math.random() * (Number(args[1]) - Number(args[0])) + Number(args[0]) },
        choice: { arity: 1, impl: (_i, args) => {
                const arr = Array.isArray(args[0]) ? args[0] : [];
                if (arr.length === 0)
                    return null;
                return arr[Math.floor(Math.random() * arr.length)];
            } },
        shuffle: { arity: 1, impl: (_i, args) => {
                const arr = Array.isArray(args[0]) ? [...args[0]] : [];
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            } },
        bool: { arity: 0, impl: () => Math.random() < 0.5 },
    },
};
const timeModule = {
    functions: {
        now: { arity: 0, impl: () => new Date().toISOString() },
        sleep: { arity: 1, impl: async (_i, args) => { await new Promise(r => setTimeout(r, Number(args[0]))); return null; } },
        format: { arity: 2, impl: (_i, args) => {
                const date = new Date(String(args[0]));
                const fmt = String(args[1]);
                return fmt.replace('YYYY', String(date.getFullYear()))
                    .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
                    .replace('DD', String(date.getDate()).padStart(2, '0'))
                    .replace('HH', String(date.getHours()).padStart(2, '0'))
                    .replace('mm', String(date.getMinutes()).padStart(2, '0'))
                    .replace('ss', String(date.getSeconds()).padStart(2, '0'));
            } },
        parse: { arity: 2, impl: (_i, args) => new Date(String(args[0])).toISOString() },
        year: { arity: 1, impl: (_i, args) => new Date(String(args[0])).getFullYear() },
        month: { arity: 1, impl: (_i, args) => new Date(String(args[0])).getMonth() + 1 },
        day: { arity: 1, impl: (_i, args) => new Date(String(args[0])).getDate() },
        hour: { arity: 1, impl: (_i, args) => new Date(String(args[0])).getHours() },
        minute: { arity: 1, impl: (_i, args) => new Date(String(args[0])).getMinutes() },
        second: { arity: 1, impl: (_i, args) => new Date(String(args[0])).getSeconds() },
        timestamp: { arity: 0, impl: () => Date.now() },
    },
};
const textModule = {
    functions: {
        upper: { arity: 1, impl: (_i, args) => String(args[0]).toUpperCase() },
        lower: { arity: 1, impl: (_i, args) => String(args[0]).toLowerCase() },
        trim: { arity: 1, impl: (_i, args) => String(args[0]).trim() },
        split: { arity: 2, impl: (_i, args) => String(args[0]).split(String(args[1])) },
        join: { arity: 2, impl: (_i, args) => Array.isArray(args[0]) ? args[0].join(String(args[1])) : '' },
        replace: { arity: 3, impl: (_i, args) => String(args[0]).replaceAll(String(args[1]), String(args[2])) },
        length: { arity: 1, impl: (_i, args) => String(args[0]).length },
        contains: { arity: 2, impl: (_i, args) => String(args[0]).includes(String(args[1])) },
        startsWith: { arity: 2, impl: (_i, args) => String(args[0]).startsWith(String(args[1])) },
        endsWith: { arity: 2, impl: (_i, args) => String(args[0]).endsWith(String(args[1])) },
        substring: { arity: 3, impl: (_i, args) => String(args[0]).substring(Number(args[1]), args[2] == null ? undefined : Number(args[2])) },
    },
};
const mathModule = {
    functions: {
        abs: { arity: 1, impl: (_i, args) => Math.abs(Number(args[0])) },
        round: { arity: 1, impl: (_i, args) => Math.round(Number(args[0])) },
        floor: { arity: 1, impl: (_i, args) => Math.floor(Number(args[0])) },
        ceil: { arity: 1, impl: (_i, args) => Math.ceil(Number(args[0])) },
        sqrt: { arity: 1, impl: (_i, args) => Math.sqrt(Number(args[0])) },
        pow: { arity: 2, impl: (_i, args) => Math.pow(Number(args[0]), Number(args[1])) },
        min: { arity: 2, impl: (_i, args) => Math.min(Number(args[0]), Number(args[1])) },
        max: { arity: 2, impl: (_i, args) => Math.max(Number(args[0]), Number(args[1])) },
        clamp: { arity: 3, impl: (_i, args) => Math.max(Number(args[1]), Math.min(Number(args[0]), Number(args[2]))) },
        random: { arity: 0, impl: () => Math.random() },
        pi: { arity: 0, impl: () => Math.PI },
        e: { arity: 0, impl: () => Math.E },
    },
};
exports.stdlib = {
    console: consoleModule,
    files: filesModule,
    folders: foldersModule,
    system: systemModule,
    random: randomModule,
    time: timeModule,
    text: textModule,
    math: mathModule,
};
//# sourceMappingURL=stdlib.js.map