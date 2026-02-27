# Snapshots

Regenerate repository snapshot artifacts with:

```bash
node ops/tools/generate_repo_snapshot.mjs
```

Snapshots are derived from `git ls-files` to avoid local/untracked artifacts.

## Determinism Check

After regenerating, verify the snapshot output is stable:

```bash
node ops/tools/generate_repo_snapshot.mjs
git diff -- ops/snapshots
```

`git diff -- ops/snapshots` should be empty on a second run when no source files changed.

## Security

Snapshots must never include real `.env` files, credentials, tokens, or other secrets.
- Real `.env` files are excluded; only `*.env.example` are allowed.
Use exclusions to keep sensitive and high-churn material out of snapshots (for example
runtime environment files, dependency/vendor directories, build artifacts, and local caches),
which reduces secret-leak risk and keeps snapshots deterministic.
