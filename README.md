# Simple Programming Language

A beginner-friendly programming language with natural English syntax. Runs on Windows, macOS, and Linux.

## Quick Install

### Linux / macOS (one-liner)
```bash
curl -fsSL https://raw.githubusercontent.com/elijahshepherd/Simple/main/scripts/install.sh | bash
```

### Windows (PowerShell one-liner)
```powershell
irm https://raw.githubusercontent.com/elijahshepherd/Simple/main/scripts/install.ps1 | iex
```

## What You Get

- `simple` command available everywhere (added to PATH)
- Run `.spml` files: `simple run file.spml`
- Built-in examples: `simple run-example hello`
- Create new projects: `simple new myproject`
- Colorful console output, variables, loops, functions
- File I/O, random, time, math, text operations
- Cross-platform: Windows, macOS, Linux

## Documentation

- [Installation Guide](https://github.com/elijahshepherd/Simple#installation)
- [Language Reference](https://github.com/elijahshepherd/Simple/blob/main/docs/LANGUAGE.md)
- [Examples](https://github.com/elijahshepherd/Simple/tree/main/examples)
- [Releases](https://github.com/elijahshepherd/Simple/releases)

## Installation Site

The installation website is at **https://simple-lang.vercel.app** (deployed on Vercel).

### Local Development (Installation Site)
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Tech Stack (Installation Site)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with CSS variables
- **Animations**: Framer Motion
- **Icons**: Lucide React + Custom SVGs
- **Deployment**: Vercel (auto-deploys from main branch)

## Platform Support

| Platform | Install Method | Notes |
|----------|---------------|-------|
| Windows | `irm ... | iex` | PowerShell install script |
| Linux | `curl ... | bash` | Shell install script |
| macOS | `curl ... | bash` | Shell install script |

## Built-in Commands

After installation, these commands are available:
- `simple version` - Show version
- `simple update` - Check for updates
- `simple uninstall` - Uninstall Simple
- `simple run <file>` - Run a Simple program
- `simple run-example <name>` - Run built-in example
- `simple examples` - List available examples
- `simple new <name>` - Create a new project scaffold

## Project Structure

```
Simple/
├── src/                    # Core language implementation (TypeScript)
│   ├── index.ts           # CLI entry point
│   ├── lexer.ts           # Tokenizer
│   ├── parser.ts          # Parser
│   ├── interpreter.ts     # Interpreter
│   ├── stdlib.ts          # Standard library
│   └── errors.ts          # Error handling
├── bin/                   # Compiled CLI entry point
├── dist/                  # Compiled JavaScript output
├── examples/              # Example .spml programs
├── installer/             # Windows installers (NSIS, C#, PowerShell)
├── scripts/               # Cross-platform install scripts
│   ├── install.sh         # Linux/macOS installer
│   ├── install.ps1        # Windows PowerShell installer
│   └── uninstall.ps1      # Windows uninstaller
├── vscode-extension/      # VS Code language support
├── syntaxes/              # TextMate grammar
├── docs/                  # Documentation
│   └── release/           # Release notes
├── .github/workflows/     # GitHub Actions (CI/CD)
├── package.json           # Installation site (Next.js)
├── tsconfig.json          # TypeScript config
└── CHANGELOG.md           # Changelog
```

## Adding New Versions

1. Create a new markdown file in `docs/release/` with version number (e.g., `1.6.0.md`)
2. Follow the format in `docs/release/1.5.0.md`
3. Push to main branch - Vercel will auto-deploy the installation site
4. GitHub Actions will build and create a release with binaries

## License

MIT License - see LICENSE file for details.