import { execSync, spawnSync } from 'node:child_process';
import process from 'node:process';

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 500;
const REPO_HINT = 'english-microcoach';

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function killLockingNodeProcesses() {
  const currentPid = process.pid;

  try {
    if (process.platform === 'win32') {
      const escapedHint = REPO_HINT.replace(/'/g, "''");
      const command = [
        'Get-CimInstance Win32_Process',
        "| Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match '" + escapedHint + "' }",
        '| Select-Object -ExpandProperty ProcessId'
      ].join(' ');

      const output = execSync(`powershell -NoProfile -Command "${command}"`, {
        stdio: ['ignore', 'pipe', 'ignore'],
        encoding: 'utf8'
      }).trim();

      if (!output) {
        return;
      }

      const pids = output
        .split(/\r?\n/)
        .map((line) => Number.parseInt(line.trim(), 10))
        .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== currentPid);

      for (const pid of pids) {
        try {
          spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
        } catch {
          // best effort
        }
      }

      return;
    }

    const output = execSync('ps -eo pid,args', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8'
    });

    const pids = output
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d+)\s+(.+)$/);
        if (!match) {
          return null;
        }
        const pid = Number.parseInt(match[1], 10);
        const args = match[2];
        return { pid, args };
      })
      .filter(Boolean)
      .filter(({ pid, args }) => {
        return pid !== currentPid && /\b(node|tsx|pnpm)\b/.test(args) && args.includes(REPO_HINT);
      })
      .map(({ pid }) => pid);

    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {
        // best effort
      }
    }
  } catch {
    // best effort
  }
}

function runGenerate() {
  const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  return spawnSync(command, ['exec', 'prisma', 'generate'], {
    stdio: 'pipe',
    encoding: 'utf8', 
    env: process.env
  });
}
function printProcessOutput(label, output) {
  if (!output) {
    return;
  }

  const trimmed = output.trimEnd();
  if (!trimmed) {
    return;
  }

  console.error(`--- prisma generate ${label} ---`);
  console.error(trimmed);
}

killLockingNodeProcesses();

for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
  const result = runGenerate();
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status === 0) {
    process.exit(0);
  }
   const exitCode = Number.isInteger(result.status) ? result.status : null;
   const signal = result.signal ?? 'none';

   console.error(
    `\nPrisma generate failed (attempt ${attempt}/${MAX_RETRIES}). exitCode=${exitCode ?? 'null'} signal=${signal}`
  );
   printProcessOutput('stdout', result.stdout);
   printProcessOutput('stderr', result.stderr);

   if (result.error) {
     console.error('--- prisma generate spawn error ---');
     console.error(result.error);
   }

  if (attempt < MAX_RETRIES) {
    const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
    console.warn(`Retrying prisma generate in ${delay}ms...`);
    sleep(delay);
    continue;
  }

  if (Number.isInteger(result.status)) {
    process.exit(result.status);
  }

  if (result.signal) {
    process.kill(process.pid, result.signal);
  }

  process.exit(1);
}

