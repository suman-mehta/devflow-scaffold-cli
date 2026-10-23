#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import os from 'node:os';

const HELP_TEXT = `devflow - Modern Developer Workflow Automation & Scaffolding CLI

Usage:
  devflow new <project-name> [--template=js|ts]   Create a new project scaffold
  devflow run <script>                           Run an npm script in the current project
  devflow --help                                 Show this help

Options:
  --template   Choose a starter template (default: js)
`;

async function createProject(name, template) {
  const target = path.resolve(process.cwd(), name);
  await fs.mkdir(target, { recursive: true });

  const pkg = {
    name,
    version: "0.1.0",
    scripts: {
      start: template === 'ts' ? "node dist/index.js" : "node index.js"
    }
  };
  await fs.writeFile(path.join(target, 'package.json'), JSON.stringify(pkg, null, 2));

  const entryFile = template === 'ts' ? 'src/index.ts' : 'index.js';
  const entryPath = path.join(target, entryFile);
  await fs.mkdir(path.dirname(entryPath), { recursive: true });

  const entryContent = template === 'ts'
    ? `export const hello = (): void => { console.log('Hello from TypeScript scaffold!'); };`
    : `console.log('Hello from JavaScript scaffold!');`;

  await fs.writeFile(entryPath, entryContent);
  console.log(`Project "${name}" created with ${template} template.`);
}

function runScript(script) {
  const result = spawnSync('npm', ['run', script], { stdio: 'inherit', shell: true });
  if (result.error) {
    console.error(`Failed to run script "${script}":`, result.error);
    process.exit(1);
  }
  process.exit(result.status ?? 0);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help')) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const command = args[0];
  if (command === 'new') {
    const name = args[1];
    if (!name) {
      console.error('Project name is required.');
      process.exit(1);
    }
    const templateArg = args.find(arg => arg.startsWith('--template='));
    const template = templateArg ? templateArg.split('=')[1] : 'js';
    if (!['js', 'ts'].includes(template)) {
      console.error('Invalid template. Use "js" or "ts".');
      process.exit(1);
    }
    await createProject(name, template);
    process.exit(0);
  } else if (command === 'run') {
    const script = args[1];
    if (!script) {
      console.error('Script name is required.');
      process.exit(1);
    }
    runScript(script);
  } else {
    console.error('Unknown command.');
    process.exit(1);
  }
}

await main();