import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');

const require = createRequire(import.meta.url);

const resolveExpoPackageJson = () => {
  const lookupPaths = [process.cwd(), __dirname, appRoot];

  try {
    return require.resolve('expo/package.json', { paths: lookupPaths });
  } catch {
    return null;
  }
};

const resolveCliPath = (expoPkgJsonPath) => {
  const expoPkgRoot = path.dirname(expoPkgJsonPath);

  const expoCli = path.join(expoPkgRoot, 'bin', 'cli');
  const expoCliJs = path.join(expoPkgRoot, 'bin', 'cli.js');

  if (existsSync(expoCli)) {
    return expoCli;
  }

  if (existsSync(expoCliJs)) {
    return expoCliJs;
  }

  const expoResolver = createRequire(expoPkgJsonPath);
  const expoCliCandidates = ['@expo/cli/build/bin/cli', '@expo/cli/build/bin/cli.js'];

  for (const candidate of expoCliCandidates) {
    try {
      return expoResolver.resolve(candidate);
    } catch {
      // Keep trying fallback candidates.
    }
  }

  return null;
};

const cliInputArgs = process.argv.slice(2);
const normalizedArgs = cliInputArgs[0] === '--' ? cliInputArgs.slice(1) : cliInputArgs;
const [subcommand, ...restArgs] = normalizedArgs;
const supportedSubcommands = new Set(['start', 'export']);

if (!subcommand || !supportedSubcommands.has(subcommand)) {
  console.error('Usage: node ./scripts/expo.mjs <start|export> [...args]');
  process.exit(1);
}

const expoPkgJsonPath = resolveExpoPackageJson();

if (!expoPkgJsonPath) {
  console.error(
    `Unable to resolve expo/package.json from: ${[process.cwd(), __dirname, appRoot].join(', ')}`
  );
  process.exit(1);
}

const cliPath = resolveCliPath(expoPkgJsonPath);

if (!cliPath) {
  console.error(
    [
      `Unable to resolve Expo CLI from installed expo package at: ${path.dirname(expoPkgJsonPath)}`,
      'Tried expo/bin/cli, expo/bin/cli.js, and @expo/cli/build/bin/cli(.js).',
    ].join('\n')
  );
  process.exit(1);
}

const child = spawn(process.execPath, [cliPath, subcommand, ...restArgs], {
  cwd: appRoot,
  env: process.env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
