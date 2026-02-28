# @emc/mobile

Expo React Native app for English MicroCoach.

## Commands

From repo root:

```bash
pnpm --filter @emc/mobile dev
pnpm --filter @emc/mobile build
pnpm --filter @emc/mobile start
```

From `apps/mobile` directly:

```bash
pnpm dev
pnpm build
pnpm start
```

## Expo wrapper (required)

All scripts call:

```text
node ./scripts/expo.mjs <start|export>
```

The wrapper resolves Expo CLI from installed packages and avoids stale global `expo` CLI assumptions.

## API base URL

Set `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Notes:
- Android emulator automatically rewrites `localhost`/`127.0.0.1` to `10.0.2.2`.
- Physical device on Expo Go must use your LAN IP manually.

## Metro / runtime notes

- Run from monorepo root so workspace deps resolve consistently.
- If Metro cache is stale, restart dev server with:

```bash
pnpm --filter @emc/mobile dev -- --clear
```

## Troubleshooting

- **Wrapper error: Expo not resolved**: run `pnpm install` at repo root.
- **API calls fail from phone**: set `EXPO_PUBLIC_API_URL` to `http://<your-lan-ip>:3001`.
- **Android cannot reach localhost**: keep `localhost` in env; app converts it to `10.0.2.2` automatically.
