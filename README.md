# Redis Protocol Cheat Sheet

A compact Redis protocol reference for developers building clients, proxies, protocol test suites, or Redis-compatible servers.

The site focuses on the implementation details that matter most:

- Command shapes and parameters
- RESP2 and RESP3 reply forms
- Null, array, map, push, blocking, transaction, Pub/Sub, stream, and cluster edge cases
- Fast search and filters by category or protocol concern
- A global RESP2/RESP3 toggle

## Tech Stack

- [Astro](https://astro.build/)
- TypeScript command data
- Plain CSS
- Static output, no backend

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Build static assets:

```bash
pnpm build
```

The hosting-ready output is generated in:

```text
dist/
```

## Project Structure

```text
src/data/commands.ts    Redis command reference data
src/pages/index.astro   Main generated cheat sheet page
src/styles/global.css   Site styling
dist/                   Static build output
```

## Notes

This is an implementer-focused cheat sheet, not a complete Redis manual. It intentionally prioritizes protocol shape, reply types, and sharp edge conditions over exhaustive command documentation.
