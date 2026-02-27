const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// pnpm workspaces hoist dependencies to the repo root, so Metro needs explicit
// watch and node_modules paths to resolve expo/AppEntry.js from the app package.
config.watchFolders = [
  ...(config.watchFolders || []),
  repoRoot,
  path.resolve(repoRoot, 'packages/shared'),
];

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(repoRoot, 'node_modules'),
    path.resolve(projectRoot, 'node_modules'),
  ],
  disableHierarchicalLookup: true,
};

module.exports = config;
