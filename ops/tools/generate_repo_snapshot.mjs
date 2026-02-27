import { promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

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

const execFileAsync = promisify(execFile);

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

async function getTrackedFiles() {
  try {
    const { stdout } = await execFileAsync('git', ['ls-files', '-z'], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });

    return stdout
      .split('\u0000')
      .filter(Boolean)
      .map((relativePath) => toPosix(relativePath))
      .filter((relativePath) => !isExcluded(path.basename(relativePath), relativePath))
      .sort(compareLex);
  } catch (error) {
    console.error('Failed to list tracked files via `git ls-files -z`.');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function createTreeFromFiles(files) {
  const root = new Map();

  for (const filePath of files) {
    const segments = filePath.split('/');
    let current = root;
    for (const segment of segments) {
      if (!current.has(segment)) {
        current.set(segment, new Map());
      }
      current = current.get(segment);
    }
  }

  return root;
}

function buildTopLevelTree(files, maxDepth = 4) {
  const lines = ['.'];
  const tree = createTreeFromFiles(files);

  function visit(nodes, currentPath, depth) {
    if (depth >= maxDepth) {
      return;
    }

    const sortedEntries = [...nodes.entries()].sort(([a], [b]) => compareLex(a, b));

    for (const [name, children] of sortedEntries) {
      const entryRel = currentPath ? `${currentPath}/${name}` : name;
      const isDirectory = children.size > 0;
      lines.push(`${'  '.repeat(depth + 1)}- ${entryRel}${isDirectory ? '/' : ''}`);

      if (isDirectory) {
        visit(children, entryRel, depth + 1);
      }
    }
  }

  visit(tree, '', 0);
  return lines;
}

function listSubdirectories(parentRelative, trackedFiles) {
  const prefix = `${parentRelative}/`;
  const subdirectories = new Set();

  for (const filePath of trackedFiles) {
    if (!filePath.startsWith(prefix)) {
      continue;
    }

    const remainder = filePath.slice(prefix.length);
    const [subdir] = remainder.split('/');
    if (subdir && !excludedNames.has(subdir)) {
      subdirectories.add(`${parentRelative}/${subdir}`);
    }
  }

  return [...subdirectories].sort(compareLex);
}

function fileExists(relativeFilePath, trackedFilesSet) {
  return trackedFilesSet.has(relativeFilePath);
}

function findTsconfigFiles(projectRelative, trackedFiles) {
  const prefix = `${projectRelative}/`;
  return trackedFiles
    .filter((filePath) => filePath.startsWith(prefix))
    .filter((filePath) => /^tsconfig.*\.json$/u.test(filePath.slice(prefix.length)))
    .sort(compareLex);
}

function collectProjectEntries(trackedFiles) {
  const trackedFilesSet = new Set(trackedFiles);
  const projectRoots = [
    ...listSubdirectories('apps', trackedFiles),
    ...listSubdirectories('packages', trackedFiles),
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
    const tsconfigs = findTsconfigFiles(projectRoot, trackedFiles);
    found.push(...tsconfigs);

    for (const candidate of keyCandidates) {
      const rel = `${projectRoot}/${candidate}`;
      if (fileExists(rel, trackedFilesSet)) {
        found.push(rel);
      }
    }

    found.sort(compareLex);
    result.push({ projectRoot, keyFiles: found });
  }

  return result;
}

function listFilesInDir(relativeDir, trackedFiles) {
  const prefix = `${relativeDir}/`;
  return trackedFiles
    .filter((filePath) => filePath.startsWith(prefix))
    .filter((filePath) => !filePath.slice(prefix.length).includes('/'))
    .sort(compareLex);
}

function listDockerComposeFiles(trackedFiles) {
  return trackedFiles
    .filter((filePath) => !filePath.includes('/'))
    .filter((filePath) => /^docker-compose.*\.yml$/u.test(filePath))
    .sort(compareLex);
}

function renderList(items) {
  if (items.length === 0) {
    return ['- (none)'];
  }
  return items.map((item) => `- ${item}`);
}

function generateSnapshotMarkdown(trackedFiles) {
  const topLevelTree = buildTopLevelTree(trackedFiles, 4);
  const projects = collectProjectEntries(trackedFiles);
  const workflows = listFilesInDir('.github/workflows', trackedFiles);
  const dockerComposeFiles = listDockerComposeFiles(trackedFiles);
  const docsFiles = listFilesInDir('docs', trackedFiles);

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

  const files = await getTrackedFiles();
  await fs.writeFile(fileIndexPath, `${JSON.stringify(files, null, 2)}\n`, 'utf8');

  const markdown = generateSnapshotMarkdown(files);
  await fs.writeFile(repoSnapshotPath, markdown, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
