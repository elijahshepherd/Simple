# Simple - The programming language for you

> [!WARNING]
> **Important:** Simple is a standalone Windows executable. **Go to the [changelog site](https://elijahshepherd.github.io/Simple/) to download `simple.exe`, run it, click Install, then open a new terminal to use `simple` commands.**

<img width="1897" height="1265" alt="Simple-Banner-3" src="https://github.com/user-attachments/assets/3fc77c52-94aa-4cb9-b777-619699487722" />

You have always wanted to code and experience the feeling of building something yourself, but most programming languages feel overwhelming and complicated. Simple changes that by giving you a beginner-friendly experience while still making you feel like a professional from the very start.

The name says it all. With Simple, you can write code using real plain English, not just simplified syntax that still feels like traditional programming. Create, experiment, and bring your ideas to life without needing to learn complex rules first.

**Get started:** [Download simple.exe](https://elijahshepherd.github.io/Simple/) → Run it → Click Install → Open new terminal → `simple run-example hello`

**Only supported on Windows** (Linux/macOS coming soon)

---

## Features

- **Natural English Syntax** - Write code using plain English words
- **Standalone Executable** - No Node.js, Python, or any runtime needed
- **Auto-Installer** - Adds to PATH, creates Start Menu shortcuts
- **Full Language** - Variables, loops, functions, lists, dicts, file I/O, and more

---

## Quick Start

1. **Download** → [https://elijahshepherd.github.io/Simple/](https://elijahshepherd.github.io/Simple/)
2. **Run** `simple.exe` — welcome screen appears
3. **Click "Install"** — adds to PATH, creates shortcuts
4. **Open new terminal** and try:

```simple
say "Hello, World!"
remember name as "Simple"
say "Welcome to " name "!"

repeat 3 times
  say "This is easy!"
end
```

---

## Commands

| Command | Description |
|---------|-------------|
| `simple run file.spml` | Run a Simple program |
| `simple run-example hello` | Run built-in hello example |
| `simple examples` | List all built-in examples |
| `simple new myproject` | Create new project scaffold |
| `simple --version` | Show version (1.5.0) |
| `simple --help` | Show all commands |

---

## Built-in Examples

Run any with `simple run-example <name>`:
- `hello` - Colors, variables, math
- `calculator` - Interactive calculator
- `conditions` - If/else demonstrations
- `counter` - Simple counter loop
- `file_creator` - File operations
- `functions` - Functions & recursion
- `guess_number` - Number guessing game
- `lists` - List operations
- `loops` - Various loop types
- `login` - Login simulation
- `random` - Random number generation
- `read_file` - File reading
- `todo` - Todo list app
- `write_file` - File writing

---

## Syntax Example

```simple
# Variables
remember score as 95
remember name as "Alice"

# Conditionals
if score is greater than or equal to 90
  say green "Grade: A"
otherwise if score is greater than or equal to 80
  say green "Grade: B"
otherwise
  say red "Grade: F"
end

# Loops
repeat 5 times
  say "Iteration: " (5 minus 1)
end

# Functions
function greet with name
  return "Hello, " name "!"
end

say call greet with "World"

# Lists
remember fruits as ["apple", "banana", "cherry"]
fruits.push "date"
say fruits.length
```

---

## Installation Details

The installer:
- Installs to `%LOCALAPPDATA%\Simple\`
- Adds `%LOCALAPPDATA%\Simple\bin\` to your user PATH
- Creates Start Menu shortcuts: Simple, Uninstall, Documentation
- Registers in Windows "Apps & Features" for clean uninstall

**After installing, open a new terminal** to use `simple` command.

---

## Changelog

View all versions and changes at: **[https://elijahshepherd.github.io/Simple/](https://elijahshepherd.github.io/Simple/)**

---

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Build standalone executable
npm run pkg:win
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Links

- **Download & Changelog:** https://elijahshepherd.github.io/Simple/
- **Repository:** https://github.com/elijahshepherd/Simple
- **Issues:** https://github.com/elijahshepherd/Simple/issues