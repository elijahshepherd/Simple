"use strict";
const { Parser } = require('./parser.js');
const { Interpreter } = require('./interpreter.js');
const { formatError } = require('./errors.js');
const { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, copyFileSync } = require('fs');
const { join, dirname, basename } = require('path');
const { execSync } = require('child_process');
const readline = require('readline/promises');
// Find examples directory - works for both source and pkg'd executable
function getExamplesDir() {
    // First try: relative to __dirname (source/build)
    let dir = join(__dirname, '..', 'examples');
    if (existsSync(dir))
        return dir;
    // Second try: relative to process.execPath (pkg executable location)
    dir = join(dirname(process.execPath), '..', 'examples');
    if (existsSync(dir))
        return dir;
    // Third try: pkg's temporary extraction path
    const pkgProcess = process;
    if (pkgProcess.pkg && pkgProcess.pkg.entrypoint) {
        dir = join(dirname(pkgProcess.pkg.entrypoint), '..', 'examples');
        if (existsSync(dir))
            return dir;
    }
    // Fallback: current working directory
    dir = join(process.cwd(), 'examples');
    if (existsSync(dir))
        return dir;
    // Last resort: return the original path (will fail gracefully)
    return join(__dirname, '..', 'examples');
}
const EXAMPLES_DIR = getExamplesDir();
const INSTALL_DIR = join(process.env.LOCALAPPDATA || join(process.env.USERPROFILE, 'AppData', 'Local'), 'Simple');
const BIN_DIR = join(INSTALL_DIR, 'bin');
const INSTALLED_EXE = join(BIN_DIR, 'simple.exe');
const VERSION = '1.5.0';
// Check if this is the installed version
function isInstalledVersion() {
    try {
        const currentExe = process.execPath;
        return currentExe.toLowerCase() === INSTALLED_EXE.toLowerCase();
    }
    catch {
        return false;
    }
}
// Check if simple is in PATH
function isInPath() {
    try {
        const pathEnv = process.env.PATH || '';
        const paths = pathEnv.split(';').map(p => p.trim().toLowerCase());
        return paths.includes(BIN_DIR.toLowerCase());
    }
    catch {
        return false;
    }
}
// Show welcome/install prompt
async function showWelcomeAndInstall() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                                                              ║');
    console.log('║     Welcome to Simple Programming Language v' + VERSION + '       ║');
    console.log('║                                                              ║');
    console.log('║     Simple is not installed on this system yet.             ║');
    console.log('║                                                              ║');
    console.log('║     Would you like to install it now?                       ║');
    console.log('║     This will add `simple` to your PATH so you can          ║');
    console.log('║     run it from anywhere.                                   ║');
    console.log('║                                                              ║');
    console.log('║     [Y] Yes, install Simple (recommended)                   ║');
    console.log('║     [N] No, just run this time                              ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question('Install Simple? [Y/n]: ');
    rl.close();
    return answer.trim().toLowerCase() !== 'n';
}
// Install Simple to user directory
async function installSimple() {
    try {
        console.log('\nInstalling Simple...');
        // Create directories
        mkdirSync(INSTALL_DIR, { recursive: true });
        mkdirSync(BIN_DIR, { recursive: true });
        mkdirSync(join(INSTALL_DIR, 'examples'), { recursive: true });
        // Copy this executable
        const currentExe = process.execPath;
        copyFileSync(currentExe, INSTALLED_EXE);
        // Copy examples
        if (existsSync(EXAMPLES_DIR)) {
            const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith('.spml'));
            for (const file of files) {
                copyFileSync(join(EXAMPLES_DIR, file), join(INSTALL_DIR, 'examples', file));
            }
        }
        // Create uninstaller
        const uninstaller = join(INSTALL_DIR, 'uninstall.bat');
        writeFileSync(uninstaller, `@echo off
echo Uninstalling Simple Programming Language...
set "INSTALL_DIR=${INSTALL_DIR.replace(/\\/g, '\\\\')}"
set "BIN_DIR=${BIN_DIR.replace(/\\/g, '\\\\')}"
set "START_MENU=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Simple Programming Language"

echo Removing from PATH...
set "CURRENT_PATH=%PATH%"
set "NEW_PATH=%CURRENT_PATH:%BIN_DIR%;=%"
set "NEW_PATH=%NEW_PATH:;%=%"
setx PATH "%NEW_PATH%" >nul

echo Removing files...
rmdir /s /q "%INSTALL_DIR%" 2>nul
rmdir /s /q "%START_MENU%" 2>nul

echo.
echo Simple has been uninstalled.
pause
`, 'utf8');
        // Create Start Menu shortcuts (using PowerShell)
        const psScript = `
$shell = New-Object -ComObject WScript.Shell
$startMenu = Join-Path $env:APPDATA "Microsoft\\Windows\\Start Menu\\Programs\\Simple Programming Language"
if (-not (Test-Path $startMenu)) { New-Item -ItemType Directory -Path $startMenu | Out-Null }

$shortcut = $shell.CreateShortcut(Join-Path $startMenu "Simple.lnk")
$shortcut.TargetPath = "${INSTALLED_EXE.replace(/\\/g, '\\\\')}"
$shortcut.WorkingDirectory = "${BIN_DIR.replace(/\\/g, '\\\\')}"
$shortcut.Description = "Simple Programming Language"
$shortcut.Save()

$shortcut = $shell.CreateShortcut(Join-Path $startMenu "Uninstall.lnk")
$shortcut.TargetPath = "cmd.exe"
$shortcut.Arguments = "/c ${uninstaller.replace(/\\/g, '\\\\')}"
$shortcut.WorkingDirectory = "${INSTALL_DIR.replace(/\\/g, '\\\\')}"
$shortcut.Description = "Uninstall Simple Programming Language"
$shortcut.Save()

$shortcut = $shell.CreateShortcut(Join-Path $startMenu "Documentation.lnk")
$shortcut.TargetPath = "https://github.com/elijahshepherd/Simple"
$shortcut.Description = "Simple Programming Language Documentation"
$shortcut.Save()
`;
        execSync(`powershell -ExecutionPolicy Bypass -Command "${psScript.replace(/"/g, '\\"')}"`, { stdio: 'ignore' });
        // Add to user PATH using PowerShell (more reliable than setx)
        const currentPath = process.env.PATH || '';
        if (!currentPath.toLowerCase().includes(BIN_DIR.toLowerCase())) {
            const psPathCmd = `[Environment]::SetEnvironmentVariable('PATH', [Environment]::GetEnvironmentVariable('PATH', 'User') + ';${BIN_DIR.replace(/\\/g, '\\\\')}', 'User')`;
            execSync(`powershell -ExecutionPolicy Bypass -Command "${psPathCmd}"`, { stdio: 'ignore' });
            // Also update current process PATH for immediate use
            process.env.PATH = currentPath + ';' + BIN_DIR;
        }
        console.log('\n✓ Simple installed successfully!');
        console.log(`  Installed to: ${INSTALL_DIR}`);
        console.log(`  Added to PATH: ${BIN_DIR}`);
        console.log('\nYou can now run `simple` from any new terminal window.');
        console.log('Try: simple run-example hello\n');
        return true;
    }
    catch (error) {
        const err = error;
        console.error('\n✗ Installation failed:', err.message);
        return false;
    }
}
// Run installed version with forwarded arguments
function runInstalledVersion(args) {
    try {
        const child = require('child_process').spawnSync(INSTALLED_EXE, args, {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        process.exit(child.status || 0);
    }
    catch (error) {
        const err = error;
        console.error('Failed to launch installed version:', err.message);
        process.exit(1);
    }
}
async function runFile(filePath, args = []) {
    try {
        const source = readFileSync(filePath, 'utf8');
        const parser = new Parser(source);
        const program = parser.parse();
        const interpreter = new Interpreter();
        interpreter.globals.define('args', args);
        await interpreter.interpret(program);
    }
    catch (error) {
        if (error instanceof Error) {
            const source = readFileSync(filePath, 'utf8');
            console.error(formatError(error, source));
        }
        else {
            console.error('Error:', error);
        }
        process.exit(1);
    }
}
async function buildFile(inputPath, outputPath) {
    const source = readFileSync(inputPath, 'utf8');
    const parser = new Parser(source);
    const program = parser.parse();
    const outPath = outputPath || inputPath.replace('.spml', '.js');
    const wrapper = `// Compiled from ${inputPath}
const { Interpreter } = require('./dist/interpreter.js');
const { Parser } = require('./dist/parser.js');

const source = \`${source.replace(/`/g, '\\`')}\`;
const parser = new Parser(source);
const program = parser.parse();
const interpreter = new Interpreter();
await interpreter.interpret(program);
`;
    writeFileSync(outPath, wrapper);
    console.log(`Built ${inputPath} -> ${outPath}`);
}
function newProject(name) {
    const projectDir = join(process.cwd(), name);
    if (existsSync(projectDir)) {
        console.error(`Directory "${name}" already exists`);
        process.exit(1);
    }
    mkdirSync(projectDir, { recursive: true });
    mkdirSync(join(projectDir, 'data'), { recursive: true });
    mkdirSync(join(projectDir, 'output'), { recursive: true });
    const mainSpml = `# ${name} - Simple 1.0 Program

say "Hello from ${name}!"

remember name as "World"
say "Hello, " name "!"

# Your code here
`;
    const helpersSpml = `# Helper functions for ${name}

# function greet with name
#   say "Hello, " name "!"
# end
`;
    writeFileSync(join(projectDir, 'main.spml'), mainSpml);
    writeFileSync(join(projectDir, 'helpers.spml'), helpersSpml);
    console.log(`Created project "${name}" with:`);
    console.log(`  ${name}/`);
    console.log(`  ├── main.spml`);
    console.log(`  ├── helpers.spml`);
    console.log(`  ├── data/`);
    console.log(`  └── output/`);
}
function listExamples() {
    if (!existsSync(EXAMPLES_DIR)) {
        console.log('No examples found');
        return;
    }
    const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith('.spml'));
    console.log('Available examples:');
    for (const file of files) {
        const name = file.replace('.spml', '');
        console.log(`  ${name}`);
    }
}
async function runExample(name) {
    const filePath = join(EXAMPLES_DIR, `${name}.spml`);
    if (!existsSync(filePath)) {
        console.error(`Example "${name}" not found`);
        console.log('Run "simple examples" to see available examples');
        process.exit(1);
    }
    await runFile(filePath);
}
function showHelp() {
    console.log(`Simple ${VERSION} - Beginner-friendly programming language
Usage: simple <command> [options]

Commands:
  run <file.spml>        Run a Simple program
  build <file.spml>      Build a Simple program to JavaScript
  new <name>             Create a new project scaffold
  examples               List available examples
  run-example <name>     Run a built-in example
  --version              Show version
  --help                 Show this help

Examples:
  simple run hello.spml
  simple build main.spml -o main.js
  simple new myproject
  simple run-example hello
`);
}
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    // First-run installation check
    if (!isInstalledVersion()) {
        // Not running from installed location
        // No arguments = show welcome and prompt to install
        if (args.length === 0) {
            const shouldInstall = await showWelcomeAndInstall();
            if (shouldInstall) {
                const success = await installSimple();
                if (success) {
                    // Re-run with installed version (no args to show help)
                    runInstalledVersion([]);
                    return;
                }
                else {
                    console.log('Continuing without installation...\n');
                }
            }
            else {
                console.log('Continuing without installation...\n');
            }
            // If not installed or user declined, show help and exit
            showHelp();
            console.log('\n---');
            console.log('Note: Simple is not installed. Run without arguments to install.');
            return;
        }
        // Explicit version/help flags
        if (command === '--version' || command === '-v') {
            console.log(VERSION);
            return;
        }
        if (command === '--help' || command === '-h') {
            showHelp();
            console.log('\n---');
            console.log('Note: Simple is not installed. Run without arguments to install.');
            return;
        }
        // For other commands, prompt to install
        const shouldInstall = await showWelcomeAndInstall();
        if (shouldInstall) {
            const success = await installSimple();
            if (success) {
                // Re-run with installed version
                runInstalledVersion(args);
                return;
            }
            else {
                console.log('Continuing without installation...\n');
            }
        }
        else {
            console.log('Continuing without installation...\n');
        }
    }
    // Running from installed location or user chose not to install
    switch (command) {
        case 'run': {
            const file = args[1];
            if (!file) {
                console.error('Usage: simple run <file.spml>');
                process.exit(1);
            }
            await runFile(file, args.slice(2));
            break;
        }
        case 'build': {
            const file = args[1];
            const outIdx = args.indexOf('-o');
            const output = outIdx !== -1 ? args[outIdx + 1] : undefined;
            if (!file) {
                console.error('Usage: simple build <file.spml> [-o output]');
                process.exit(1);
            }
            await buildFile(file, output);
            break;
        }
        case 'new': {
            const name = args[1];
            if (!name) {
                console.error('Usage: simple new <name>');
                process.exit(1);
            }
            newProject(name);
            break;
        }
        case 'examples':
            listExamples();
            break;
        case 'run-example': {
            const name = args[1];
            if (!name) {
                console.error('Usage: simple run-example <name>');
                process.exit(1);
            }
            await runExample(name);
            break;
        }
        case '--version':
        case '-v':
            console.log(VERSION);
            break;
        case '--help':
        case '-h':
        default:
            showHelp();
            break;
    }
}
module.exports = { main };
//# sourceMappingURL=index.js.map