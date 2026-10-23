import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, rm, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const CLI_PATH = path.resolve(import.meta.url.replace('file://', ''), '..', '..', 'src', 'index.js');

test('devflow new creates js project scaffold', async (t) => {
  const tmpDir = path.join(os.tmpdir(), `devflow-test-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });
  const projectName = 'sample-js';
  const result = spawnSync('node', [CLI_PATH, 'new', projectName, '--template=js'], {
    cwd: tmpDir,
    stdio: 'pipe',
    encoding: 'utf-8',
    shell: true,
  });
  assert.equal(result.status, 0, 'CLI should exit with 0');
  const projectPath = path.join(tmpDir, projectName);
  const pkgData = JSON.parse(await readFile(path.join(projectPath, 'package.json'), 'utf-8'));
  assert.equal(pkgData.name, projectName);
  const entryContent = await readFile(path.join(projectPath, 'index.js'), 'utf-8');
  assert.match(entryContent, /Hello from JavaScript scaffold/);
  await rm(tmpDir, { recursive: true, force: true });
});

test('devflow new creates ts project scaffold', async (t) => {
  const tmpDir = path.join(os.tmpdir(), `devflow-test-${Date.now()}-ts`);
  await mkdir(tmpDir, { recursive: true });
  const projectName = 'sample-ts';
  const result = spawnSync('node', [CLI_PATH, 'new', projectName, '--template=ts'], {
    cwd: tmpDir,
    stdio: 'pipe',
    encoding: 'utf-8',
    shell: true,
  });
  assert.equal(result.status, 0);
  const projectPath = path.join(tmpDir, projectName);
  const pkgData = JSON.parse(await readFile(path.join(projectPath, 'package.json'), 'utf-8'));
  assert.equal(pkgData.name, projectName);
  const entryContent = await readFile(path.join(projectPath, 'src', 'index.ts'), 'utf-8');
  assert.match(entryContent, /Hello from TypeScript scaffold/);
  await rm(tmpDir, { recursive: true, force: true });
});