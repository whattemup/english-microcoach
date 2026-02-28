# @emc/mobile

Expo React Native client.

## Setup

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Set API URL in `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Commands (canonical)

```bash
pnpm --filter @emc/mobile dev
pnpm --filter @emc/mobile build
pnpm --filter @emc/mobile start
```

These run the wrapper script:
- `dev/start` -> `node ./scripts/expo.mjs start`
- `build` -> `node ./scripts/expo.mjs export`

## Notes

- Do not use a global `expo` binary in this repo.
- Android emulator auto-rewrites localhost to `10.0.2.2` in app base-url logic.
