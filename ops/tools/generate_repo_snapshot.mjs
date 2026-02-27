import { promises as fs } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const excludedNames = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.expo',
  'coverage',
  '.turbo',
  '.cache',
  '.DS_Store',
]);

const snapshotsDir = path.join(repoRoot, 'ops', 'snapshots');
const fileIndexPath = path.join(snapshotsDir, 'FILE_INDEX.json');
const repoSnapshotPath = path.join(snapshotsDir, 'REPO_SNAPSHOT.md');
const excludedRelativePaths = new Set([
  'ops/snapshots/FILE_INDEX.json',
  'ops/snapshots/REPO_SNAPSHOT.md',
]);

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function compareLex(a, b) {
  return a.localeCompare(b, 'en');
}

function isExcluded(entryName, entryRelativePath = '') {
  if (excludedNames.has(entryName)) {
    return true;
  }

  if (entryName === '.env') {
    return true;
  }

  const relativePosix = toPosix(entryRelativePath);
  return excludedRelativePaths.has(relativePosix);
}

async function readDirSorted(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  entries.sort((a, b) => compareLex(a.name, b.name));
  return entries;
}

async function walkFiles(dir, relativeDir = '') {
  const entries = await readDirSorted(dir);
  const files = [];

  for (const entry of entries) {
    const entryRelative = relativeDir ? path.join(relativeDir, entry.name) : entry.name;
    if (isExcluded(entry.name, entryRelative)) {
      continue;
    }

    const entryFullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryFullPath, entryRelative)));
    } else if (entry.isFile()) {
      files.push(toPosix(entryRelative));
    }
  }

  return files;
}

async function buildTopLevelTree(maxDepth = 4) {
  const lines = ['.'];

  async function visit(absDir, relDir, depth) {
    if (depth >= maxDepth) {
      return;
    }

    const entries = await readDirSorted(absDir);
    for (const entry of entries) {
      const entryRel = relDir ? path.join(relDir, entry.name) : entry.name;
      if (isExcluded(entry.name, entryRel)) {
        continue;
      }

      const entryDisplay = toPosix(entryRel);
      lines.push(`${'  '.repeat(depth + 1)}- ${entryDisplay}${entry.isDirectory() ? '/' : ''}`);

      if (entry.isDirectory()) {
        await visit(path.join(absDir, entry.name), entryRel, depth + 1);
      }
    }
  }

  await visit(repoRoot, '', 0);
  return lines;
}

async function listSubdirectories(parentRelative) {
  const abs = path.join(repoRoot, parentRelative);
  try {
    const entries = await readDirSorted(abs);
    return entries
      .filter((entry) => entry.isDirectory() && !excludedNames.has(entry.name))
      .map((entry) => `${parentRelative}/${entry.name}`);
  } catch {
    return [];
  }
}

async function fileExists(relativeFilePath) {
  try {
    const stat = await fs.stat(path.join(repoRoot, relativeFilePath));
    return stat.isFile();
  } catch {
    return false;
  }
}

async function findTsconfigFiles(projectRelative) {
  const abs = path.join(repoRoot, projectRelative);
  try {
    const entries = await readDirSorted(abs);
    return entries
      .filter((entry) => entry.isFile() && /^tsconfig.*\.json$/u.test(entry.name))
      .map((entry) => `${projectRelative}/${entry.name}`);
  } catch {
    return [];
  }
}

async function collectProjectEntries() {
  const projectRoots = [
    ...(await listSubdirectories('apps')),
    ...(await listSubdirectories('packages')),
  ];

  const keyCandidates = [
    'package.json',
    'Dockerfile',
    'prisma/schema.prisma',
    'src/index.ts',
    'src/index.tsx',
    'src/index.js',
    'src/index.jsx',
    'src/main.ts',
    'src/main.tsx',
    'src/main.js',
    'src/main.jsx',
    'App.tsx',
  ];

  const result = [];

  for (const projectRoot of projectRoots.sort(compareLex)) {
    const found = [];
    const tsconfigs = await findTsconfigFiles(projectRoot);
    found.push(...tsconfigs);

    for (const candidate of keyCandidates) {
      const rel = `${projectRoot}/${candidate}`;
      if (await fileExists(rel)) {
        found.push(rel);
      }
    }

    found.sort(compareLex);
    result.push({ projectRoot, keyFiles: found });
  }

  return result;
}

async function listFilesInDir(relativeDir) {
  const abs = path.join(repoRoot, relativeDir);
  try {
    const entries = await readDirSorted(abs);
    return entries
      .filter((entry) => entry.isFile() && !excludedNames.has(entry.name))
      .map((entry) => `${relativeDir}/${entry.name}`)
      .sort(compareLex);
  } catch {
    return [];
  }
}

async function listDockerComposeFiles() {
  const entries = await readDirSorted(repoRoot);
  return entries
    .filter((entry) => entry.isFile() && /^docker-compose.*\.yml$/u.test(entry.name))
    .map((entry) => entry.name)
    .sort(compareLex);
}

function renderList(items) {
  if (items.length === 0) {
    return ['- (none)'];
  }
  return items.map((item) => `- ${item}`);
}

async function generateSnapshotMarkdown() {
  const topLevelTree = await buildTopLevelTree(4);
  const projects = await collectProjectEntries();
  const workflows = await listFilesInDir('.github/workflows');
  const dockerComposeFiles = await listDockerComposeFiles();
  const docsFiles = await listFilesInDir('docs');

  const lines = [
    '# Repository Snapshot',
    '',
    '## Top-level tree (depth 4)',
    '',
    '```text',
    ...topLevelTree,
    '```',
    '',
    '## apps/* and packages/* key entry files',
    '',
  ];

  if (projects.length === 0) {
    lines.push('- (none)');
  } else {
    for (const project of projects) {
      lines.push(`### ${project.projectRoot}`);
      lines.push('');
      lines.push(...renderList(project.keyFiles));
      lines.push('');
    }
  }

  lines.push('## CI workflows (.github/workflows)');
  lines.push('');
  lines.push(...renderList(workflows));
  lines.push('');

  lines.push('## docker-compose*.yml files');
  lines.push('');
  lines.push(...renderList(dockerComposeFiles));
  lines.push('');

  lines.push('## docs/* files');
  lines.push('');
  lines.push(...renderList(docsFiles));
  lines.push('');

  return `${lines.join('\n')}`;
}

async function main() {
  await fs.mkdir(snapshotsDir, { recursive: true });
  await fs.mkdir(path.join(repoRoot, 'ops', 'tools'), { recursive: true });

  const files = (await walkFiles(repoRoot)).sort(compareLex);
  await fs.writeFile(fileIndexPath, `${JSON.stringify(files, null, 2)}\n`, 'utf8');

  const markdown = await generateSnapshotMarkdown();
  await fs.writeFile(repoSnapshotPath, markdown, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
