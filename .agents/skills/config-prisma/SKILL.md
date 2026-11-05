---
name: config-prisma
description: "Initialize and standardize Prisma infrastructure in the Piggy NestJS backend with a modular schema by domain (`apps/backend/prisma/models/*.model.prisma`), a technical seed entrypoint at `apps/backend/prisma/seed/main.ts` (no module seeds), `prisma.config.ts`, a backend Docker Compose file compatible with `DATABASE_URL` from `.env` and with names derived from the project identity, and a simple `DbModule` + `PrismaService` that matches the current project pattern. Use when the request is an initial Prisma setup, onboarding a module with its own Prisma file, or rebootstraping backend database infrastructure."
---

# Config Prisma

## Overview

Run a deterministic Prisma infrastructure setup in `apps/backend`, with a neutral seed entrypoint (no module tasks), a Nest database module, and Postgres startup through Docker Compose aligned with `.env`.
The generated database contract must match the current project: a simple `PrismaService`, without `TransactionManager` or `runInTransaction`, and Docker infrastructure derived from the project identity so repositories do not collide.

## Workflow

1. Confirm the workspace contains `apps/backend/package.json`.
2. Run the skill script:
   - `node .agents/skills/config-prisma/scripts/init-prisma-backend.js --dry-run`
   - `node .agents/skills/config-prisma/scripts/init-prisma-backend.js --apply --install`
3. Add Prisma files per module (repeatable):
   - `node .agents/skills/config-prisma/scripts/init-prisma-backend.js --apply --module auth --module product`
4. Start the database with the backend Docker Compose file:
   - `npm --workspace apps/backend run db:start`
5. Validate Prisma:
   - `npm --workspace apps/backend run prisma:generate`

## What the script guarantees

- Prisma dependencies in `apps/backend/package.json` (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `tsx`), keeping an existing version when the backend is already configured (no forced upgrade by default).
- Database and Prisma npm scripts (`db:start`, `db:stop`, `db:logs`, `prisma:generate`, `prisma:migrate:*`, `prisma:seed`, `prisma:studio`).
- Removal of the legacy `prisma:cid` script when it is present.
- `apps/backend/prisma.config.ts` with `seed: 'npx tsx prisma/seed/main.ts'`.
- `apps/backend/prisma/schema.prisma` with `generator client { provider = "prisma-client-js" }` in the current pattern.
- An initial `apps/backend/prisma/seed/main.ts` (no module implementation) using `PrismaClient` from `@prisma/client` with `PrismaPg`.
- Autocorrection only for legacy seed templates (`generated/client`, `generated/prisma`, `cid`), without overwriting modern seeds that already register module tasks.
- Does not create or change `prisma/seed/tasks/*` for specific modules.
- A temporary `apps/backend/prisma/models/bootstrap.model.prisma` only when no domain `*.model.prisma` file exists yet.
- Prisma module files named `<module-name>.model.prisma`.
- `apps/backend/docker-compose.yml` aligned with `DATABASE_URL` loaded from `apps/backend/.env` (fallback to `.env.example`), with `name`, `container_name`, volume, and connection defaults derived from the current project.
- Creation or update of `apps/backend/src/db/db.module.ts` and `apps/backend/src/db/prisma.service.ts`.
- A simple `PrismaService` in the current Nest pattern, with no `TransactionManager` dependency.
- `DbModule` added to `apps/backend/src/app.module.ts` when it is missing.

## Notes

- The script is idempotent: it can run several times without duplicating structure.
- The script installs using the real workspace name read from `apps/backend/package.json` (fallback: `apps/backend`).
- When `.env` does not yet define `DB_PORT`, `DB_USER`, and `DB_NAME`, the script derives stable defaults from the project or package name so each repository gets its own Docker instance.
- After real models exist, remove `prisma/models/bootstrap.model.prisma` (if it exists) and generate a new migration.
- On backends that have already evolved, the script avoids regressing `seed/main.ts` to the neutral template when the file already uses the modern pattern with registered tasks.
- See `references/prisma-init-checklist.md` for the operational checklist.

## Risk logging guardrails

- Record execution facts in `.log/skills.log` with a marker at the start of the line.
- Minimum expected markers: `[CMD]`, `[FILE_CREATE]`, `[FILE_UPDATE]`, `[FILE_DELETE]`, `[DIR_CREATE]`, `[RISK]`, `[FAIL]`, `[AI]`.
- Always record `[RISK]` when there is an overwrite, deletion, rename or move, or a forced fallback on files or folders.
- Every unexpected failure must produce `[FAIL]` with a short factual description of the event.
- Terminal operations and file changes should use the skill's shared utilities when they exist. When the project does not have that folder, the script must keep working with a local fallback and must not block execution.

## Global standards

- Prefer compatibility with the real structure of the current monorepo, and avoid required references to helper files that do not exist in the project.
