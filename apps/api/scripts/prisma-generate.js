 import { execSync, spawnSync } from 'node:child_process';
 import { createRequire } from 'node:module';
 import path from 'node:path';
 import process from 'node:process';
 import { fileURLToPath } from 'node:url';
 
 const MAX_RETRIES = 5;
 const BASE_DELAY_MS = 500;
 const REPO_HINT = 'english-microcoach';
 
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
 const apiDir = path.resolve(__dirname, '..');
 const monorepoRoot = path.resolve(apiDir, '../..');
 
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
 
@@ -61,93 +69,83 @@ function killLockingNodeProcesses() {
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
 
 function resolvePrismaCliPath() {
   const rootRequire = createRequire(path.join(monorepoRoot, 'package.json'));
 
   try {
     return rootRequire.resolve('prisma/build/index.js');
   } catch {
     return path.resolve(apiDir, '../../node_modules/prisma/build/index.js');
   }
 }
 
 function runGenerate() {
   const prismaCliPath = resolvePrismaCliPath();
 
   return spawnSync(process.execPath, [prismaCliPath, 'generate'], {
     stdio: 'inherit',
     cwd: apiDir,
     env: process.env
   });
 }
 
 killLockingNodeProcesses();
 
 for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
   const result = runGenerate();
 
   if (result.status === 0) {
     process.exit(0);
   }
 
   const exitCode = Number.isInteger(result.status) ? result.status : null;
   const signal = result.signal ?? 'none';
 
   console.error(
     `\nPrisma generate failed (attempt ${attempt}/${MAX_RETRIES}). exitCode=${exitCode ?? 'null'} signal=${signal}`
   );
 
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