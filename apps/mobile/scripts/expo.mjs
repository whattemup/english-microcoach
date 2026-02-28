import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');

const findWorkspaceRoot = (startDir) => {
  let current = startDir;

  while (true) {
    const workspaceFile = path.join(current, 'pnpm-workspace.yaml');
    if (existsSync(workspaceFile)) {
      return current;
    }

    const packageJsonPath = path.join(current, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        if (packageJson?.workspaces) {
          return current;
        }
      } catch {
        // Ignore invalid package.json files while traversing upward.
      }
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }
    current = parent;
  }
};

const workspaceRoot = findWorkspaceRoot(appRoot);
const resolver = createRequire(path.join(workspaceRoot, 'package.json'));

const cliCandidates = [
  'expo/bin/cli',
  'expo/bin/cli.js',
  '@expo/cli/build/bin/cli',
  '@expo/cli/build/bin/cli.js',
];

const resolvedCli = cliCandidates
  .map((candidate) => {
    try {
      return resolver.resolve(candidate, { paths: [workspaceRoot] });
    } catch {
      return null;
    }
  })
  .find(Boolean);

if (!resolvedCli) {
  console.error(
    [
      'Unable to resolve Expo CLI entrypoint for the mobile app build.',
      `Checked from workspace root: ${workspaceRoot}`,
      `Tried: ${cliCandidates.join(', ')}`,
    ].join('\n')
  );
  process.exit(1);
}

const cliArgs = process.argv.slice(2);

const child = spawn(process.execPath, [resolvedCli, ...cliArgs], {
  cwd: appRoot,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

