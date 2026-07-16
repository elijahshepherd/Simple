# Simple 1.0 — Rapid Implementation Plan (~3 Hours)

## Strategy: Single-File Compiler + Tree-Walk Interpreter (TypeScript/Node.js)

**Why not Rust VM?** Building bytecode + VM + compiler = too much boilerplate for 3 hours. A single TypeScript project that **parses .spml → AST → executes directly** is far faster.

---

## Revised Architecture

```
simple-1.0/
├── package.json
├── src/
│   ├── index.ts          # CLI entry: `simple run|build|new|examples`
│   ├── lexer.ts          # Tokenizer
│   ├── parser.ts         # Recursive descent → AST
│   ├── interpreter.ts    # Tree-walking interpreter (executes AST directly)
│   ├── stdlib.ts         # All 8 stdlib modules as JS functions
│   ├── errors.ts         # Friendly error formatting
│   └── examples.ts       # Embedded example sources
├── examples/             # .spml files (copied from embedded)
├── bin/
│   └── simple.js         # Compiled CLI entry (shebang)
└── dist/                 # Compiled output (gitignored)
```

**Pipeline:** `.spml` → Lexer → Parser → AST → **Tree-Walk Interpreter** (no bytecode, no VM)

---

## Implementation Order (3 Hours)

### Hour 1: Core Language (Lexer → Parser → Interpreter)

| Step | File | Target |
|------|------|--------|
| 1.1 | `lexer.ts` | Tokenize all keywords, operators, literals |
| 1.2 | `parser.ts` | Parse → AST (Program, Stmt, Expr) |
| 1.3 | `interpreter.ts` | Environment, evalStmt, evalExpr, call stack |
| 1.4 | `errors.ts` | Friendly errors with source snippets |

**Test:** `simple run examples/hello.spml` → prints "Hello!"

---

### Hour 2: Stdlib + Control Flow + Examples

| Step | Feature |
|------|---------|
| 2.1 | Variables: `remember x as 5`, `ask "?" into x` |
| 2.2 | Control flow: `if/otherwise`, `repeat N times`, `repeat while` |
| 2.3 | Functions: `function name(a, b) ... end`, `return`, `call name with a, b` |
| 2.4 | **Stdlib modules (all in `stdlib.ts`):** |
| | `console`: `say`, `ask`, `clear`, colors, formatting |
| | `files`: `create`, `delete`, `write`, `append`, `read`, `exists`, `copy`, `move`, `rename`, `path_*` |
| | `folders`: `create`, `delete`, `list`, `exists`, `cwd`, `home`, `temp` |
| | `system`: `args`, `exit`, `env`, `run`, `sleep`, `platform` |
| | `random`: `int`, `float`, `choice`, `shuffle`, `bool` |
| | `time`: `now`, `sleep`, `format`, `year`/`month`/`day`/`hour`/`minute`/`second` |
| | `text`: `upper`, `lower`, `trim`, `split`, `join`, `replace`, `length`, `contains`, `starts_with`, `ends_with`, `substring` |
| | `math`: `abs`, `round`, `floor`, `ceil`, `sqrt`, `pow`, `min`, `max`, `clamp`, `random`, `pi`, `e` |
| 2.5 | Imports: `import text` → `text.upper("hi")` |

**Test:** All 12+ examples run correctly.

---

### Hour 3: CLI Polish + Installers + Docs

| Step | Task |
|------|------|
| 3.1 | CLI commands: `run`, `build` (transpile to JS), `new`, `examples`, `run-example` |
| 3.2 | `simple new <name>` scaffolds project structure |
| 3.3 | Windows installer: **pkg** → single `simple.exe` (no NSIS needed) |
| 3.4 | Unix installer: `pkg` → `simple-linux`, `simple-macos` + shell wrapper |
| 3.5 | README.md with install/run/examples |
| 3.6 | GitHub Actions: build + test on push, release on tag |

---

## Language Feature Checklist (Must Work in 3hr)

| Feature | Spec Keyword | Status |
|---------|--------------|--------|
| Print | `say "text"` / `say red "text"` | ☐ |
| Input | `ask "?" into name` | ☐ |
| Variables | `remember x as 5` | ☐ |
| Constants | `constant PI as 3.14` | ☐ |
| Math | `plus`, `minus`, `times`, `divided by`, `mod` | ☐ |
| Comparisons | `is`, `is not`, `greater than`, `less than` | ☐ |
| Logic | `and`, `or`, `not` | ☐ |
| If/Else | `if cond / otherwise / end` | ☐ |
| Repeat N | `repeat 5 times / end` | ☐ |
| Repeat While | `repeat while cond / end` | ☐ |
| Functions | `function name(a, b) / return x / end` | ☐ |
| Return | `return value` | ☐ |
| Imports | `import text as t` | ☐ |
| Lists | `[1, 2, 3]`, `list[0]`, `push`, `pop`, `length` | ☐ |
| Dicts | `{key: value}`, `dict.key`, `dict["key"]` | ☐ |
| Random | `random int 1 to 10`, `random choice from list` | ☐ |
| Time | `wait 2 seconds`, `now`, `format time` | ☐ |
| Files | `create file`, `write`, `read`, `delete`, `exists`, `copy`, `move`, `rename` | ☐ |
| Folders | `make folder`, `delete folder`, `list folder` | ☐ |
| Colors | `say red bold "text"`, `reset` | ☐ |
| Clear | `clear` | ☐ |
| Args | `args` list | ☐ |
| Exit | `exit 0` | ☐ |
| Comments | `# comment` | ☐ |

---

## Simplified Spec Decisions (for Speed)

| Spec Feature | Decision |
|--------------|----------|
| `.spc` bytecode | **Skip** — tree-walk interpreter directly |
| Rust VM | **Skip** — Node.js interpreter |
| Windows `.exe` installer | **pkg** → single binary (not NSIS) |
| Dict/Map syntax | `{key: value}` — JS object literal style |
| List syntax | `[1, 2, 3]` |
| Function call | `call name with a, b` (consistent with spec) |
| Color syntax | `say red bold "hi"` (chained modifiers) |
| `wait` | `wait 2 seconds` |
| Import | `import text` → `text.upper("hi")` |

---

## File: `package.json` (Key Scripts)

```json
{
  "name": "simple",
  "version": "1.0.0",
  "bin": { "simple": "./bin/simple.js" },
  "scripts": {
    "build": "tsc",
    "start": "node bin/simple.js",
    "test": "node bin/simple.js run examples/hello.spml",
    "pkg:win": "pkg . --targets node18-win-x64 --output simple.exe",
    "pkg:linux": "pkg . --targets node18-linux-x64 --output simple-linux",
    "pkg:mac": "pkg . --targets node18-macos-x64 --output simple-macos"
  },
  "devDependencies": { "typescript": "^5", "pkg": "^5", "@types/node": "^20" }
}
```

---

## Risk Mitigation (3-Hour Constraints)

| Risk | Mitigation |
|------|------------|
| Parser complexity | Recursive descent with precedence climbing; keep grammar simple |
| Stdlib breadth | Implement as JS functions called from interpreter; no .spml stdlib files |
| Installer time | `pkg` compiles to single binary in seconds; skip NSIS |
| Testing | Run all examples as integration test; skip unit tests |
| Colors | Use `chalk` or ANSI codes directly |

---

## Deliverables at End of 3 Hours

1. `simple` CLI (`npx simple run file.spml`)
2. `simple.exe` (Windows), `simple-linux`, `simple-macos` binaries
3. 12+ working examples in `examples/`
4. `simple new myproj` scaffolding
5. README with install + usage
6. GitHub Actions workflow for build + release

---

## Clarifying Questions (Confirmed)

1. **Function call syntax:** `call name with a, b` ✓ (spec shows this style)
2. **Dict syntax:** `{key: value}` ✓ (JS-style)
3. **List index:** `list[0]` ✓ (bracket notation)
4. **Colors:** Chained `say red bold "hi"` ✓
5. **Comments:** `# comment` ✓

---

## Next Steps

1. Initialize repo structure
2. Set up TypeScript compiler project
3. Implement lexer + parser + tests
4. Implement interpreter
5. Implement stdlib
6. Write examples
7. Build CLI + installers
8. Write README + CI
9. Release v1.0.0