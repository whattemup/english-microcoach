import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 500;
const DEFENDER_HINT =
  'Hint: verify your antivirus/Defender exclusions still include this repository to avoid rename lock conflicts.';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(apiDir, '..', '..');

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function resolvePrismaCliPath() {
  try {
    return require.resolve('prisma/build/index.js', { paths: [repoRoot] });
  } catch {
    return path.join(repoRoot, 'node_modules', 'prisma', 'build', 'index.js');
  }
}

function runGenerate() {
  const prismaCliPath = resolvePrismaCliPath();

  const result = spawnSync(process.execPath, [prismaCliPath, 'generate'], {
    cwd: apiDir,
    env: process.env,
    encoding: 'utf8'
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return result;
}

function isRetryableRenameFailure(result) {
  const code = result.error?.code ?? result.error?.errno;
  const stderr = `${result.stderr ?? ''}`;
  const combined = `${stderr}\n${result.error?.message ?? ''}`;

  const hasPermissionCode = code === 'EPERM' || code === 'EACCES';
  const mentionsPermissionCode = /\b(EPERM|EACCES)\b/.test(combined);
  const mentionsRename = /\brename\b/i.test(combined);

  return (hasPermissionCode || mentionsPermissionCode) && mentionsRename;
}

for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
  const result = runGenerate();

  if (result.status === 0) {
    process.exit(0);
  }

  const exitCode = Number.isInteger(result.status) ? result.status : 'null';
  const errorCode = result.error?.code ?? 'n/a';
  const errorErrno = result.error?.errno ?? 'n/a';

  console.error(
    `\nPrisma generate failed (attempt ${attempt}/${MAX_RETRIES}). exitCode=${exitCode} error.code=${errorCode} error.errno=${errorErrno}`
  );
  console.error(DEFENDER_HINT);

  const retryable = isRetryableRenameFailure(result);
  if (!retryable || attempt === MAX_RETRIES) {
    if (Number.isInteger(result.status)) {
      process.exit(result.status);
    }

    if (result.signal) {
      process.kill(process.pid, result.signal);
    }

    process.exit(1);
  }

  const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
  console.warn(`Retrying prisma generate in ${delay}ms due to EPERM/EACCES rename failure...`);
  sleep(delay);
}
