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
  return require.resolve('prisma/build/index.js', { paths: [apiDir, repoRoot] });
}

function runGenerate() {
  let result;

  try {
    const prismaCli = resolvePrismaCliPath();
    result = spawnSync(process.execPath, [prismaCli, 'generate'], {
      cwd: apiDir,
      env: process.env,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Failed to resolve Prisma CLI via require.resolve. Falling back to pnpm exec.');
    console.error(error);

    result = spawnSync('cmd.exe', ['/d', '/s', '/c', 'pnpm --filter @emc/api exec prisma generate'], {
      cwd: repoRoot,
      env: process.env,
      stdio: 'inherit'
    });
  }

  return result;
}

function isRetryableFailure(result) {
  const code = result.error?.code ?? result.error?.errno;
  const combined = `${result.error?.message ?? ''}`;

  const hasPermissionCode = code === 'EPERM' || code === 'EACCES';
  const mentionsPermissionCode = /\b(EPERM|EACCES)\b/.test(combined);
  
  return hasPermissionCode || mentionsPermissionCode;
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
  
  const retryable = isRetryableFailure(result);
  if (!retryable || attempt === MAX_RETRIES) {
    if (Number.isInteger(result.status)) {
      process.exit(result.status);
    }

    if (result.signal) {
      process.kill(process.pid, result.signal);
    }

    process.exit(1);
  }
  
  console.error(DEFENDER_HINT);

  const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
  console.warn(`Retrying prisma generate in ${delay}ms due to EPERM/EACCES failure...`);
  sleep(delay);
}
