import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';
import { formatError } from './errors.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EXAMPLES_DIR = join(__dirname, '..', 'examples');

async function runFile(filePath: string, args: string[] = []): Promise<void> {
  try {
    const source = readFileSync(filePath, 'utf8');
    const parser = new Parser(source);
    const program = parser.parse();
    const interpreter = new Interpreter();
    interpreter.globals.define('args', args);
    await interpreter.interpret(program);
  } catch (error) {
    if (error instanceof Error) {
      const source = readFileSync(filePath, 'utf8');
      console.error(formatError(error as any, source));
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

async function buildFile(inputPath: string, outputPath?: string): Promise<void> {
  const source = readFileSync(inputPath, 'utf8');
  const parser = new Parser(source);
  const program = parser.parse();
  const outPath = outputPath || inputPath.replace('.spml', '.js');
  const wrapper = `// Compiled from ${inputPath}
import { Interpreter } from './dist/interpreter.js';
import { Parser } from './dist/parser.js';

const source = \`${source.replace(/`/g, '\\`')}\`;
const parser = new Parser(source);
const program = parser.parse();
const interpreter = new Interpreter();
await interpreter.interpret(program);
`;
  writeFileSync(outPath, wrapper);
  console.log(`Built ${inputPath} -> ${outPath}`);
}

function newProject(name: string): void {
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

function listExamples(): void {
  if (!existsSync(EXAMPLES_DIR)) {
    console.log('No examples found');
    return;
  }
  const files = readdirSync(EXAMPLES_DIR).filter(f => f.endsWith('.spml'));
  console.log('Available examples:');
  for (const file of files) {
    const name = file.replace('.spml', '');
    console.log(`  ${name}`);
  }
}

async function runExample(name: string): Promise<void> {
  const filePath = join(EXAMPLES_DIR, `${name}.spml`);
  if (!existsSync(filePath)) {
    console.error(`Example "${name}" not found`);
    console.log('Run "simple examples" to see available examples');
    process.exit(1);
  }
  await runFile(filePath);
}

function showHelp(): void {
  console.log(`Simple 1.0 - Beginner-friendly programming language
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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'run': {
      const file = args[1];
      if (!file) { console.error('Usage: simple run <file.spml>'); process.exit(1); }
      await runFile(file, args.slice(2));
      break;
    }
    case 'build': {
      const file = args[1];
      const outIdx = args.indexOf('-o');
      const output = outIdx !== -1 ? args[outIdx + 1] : undefined;
      if (!file) { console.error('Usage: simple build <file.spml> [-o output]'); process.exit(1); }
      await buildFile(file, output);
      break;
    }
    case 'new': {
      const name = args[1];
      if (!name) { console.error('Usage: simple new <name>'); process.exit(1); }
      newProject(name);
      break;
    }
    case 'examples':
      listExamples();
      break;
    case 'run-example': {
      const name = args[1];
      if (!name) { console.error('Usage: simple run-example <name>'); process.exit(1); }
      await runExample(name);
      break;
    }
    case '--version':
    case '-v':
      console.log('1.0.0');
      break;
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}
export { main };