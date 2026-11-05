# Prisma Init Checklist (Piggy Backend)

## Goal

Standardize the Prisma bootstrap in the NestJS backend with:

- a modular schema in `apps/backend/prisma/models/*.model.prisma`
- a technical seed entrypoint at `apps/backend/prisma/seed/main.ts` (no module seeds)
- a Nest database module in `apps/backend/src/db/*` with a simple `PrismaService` that matches the current project pattern
- a backend Docker Compose file compatible with `DATABASE_URL` and with unique names derived from the project identity

## Prerequisites

- A workspace with `apps/backend/package.json`
- `DATABASE_URL` set in `apps/backend/.env` (or in `.env.example`)
- Node.js and npm installed
- Docker and Docker Compose installed

## Steps

1. Run a simulation.
2. Apply the bootstrap.
3. Install dependencies.
4. Start Postgres with Docker Compose.
5. Generate the Prisma client.

```bash
node .agents/skills/config-prisma/scripts/init-prisma-backend.js --dry-run
node .agents/skills/config-prisma/scripts/init-prisma-backend.js --apply --install
npm --workspace apps/backend run db:start
npm --workspace apps/backend run prisma:generate
```

## Prisma module scaffold

```bash
node .agents/skills/config-prisma/scripts/init-prisma-backend.js --apply --module auth --module stock --module billing
```

## Critical files

- `apps/backend/package.json`
- `apps/backend/.env`
- `apps/backend/.env.example`
- `apps/backend/docker-compose.yml`
- `apps/backend/prisma.config.ts`
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma/seed/main.ts`
- `apps/backend/src/db/db.module.ts`
- `apps/backend/src/db/prisma.service.ts`
- `apps/backend/src/app.module.ts`

## Scope rule for this skill

- Do not include per-module data seeds (`prisma/seed/tasks/*`) at this stage.
- The seed bootstrap stays neutral until specific modules are applied.
- `prisma/models/bootstrap.model.prisma` should exist only while there are no domain `*.model.prisma` files.
- Do not overwrite a modern `prisma/seed/main.ts` (with `@prisma/client` / `PrismaPg` and module tasks). Only fix legacy templates.
- When `DB_PORT`, `DB_USER`, and `DB_NAME` are missing, the skill must derive stable defaults from the project name so Docker instances from different repositories do not conflict.

## Flags

- `--apply`: writes changes to disk
- `--dry-run`: simulates changes
- `--install`: runs `npm install --workspace <backend-workspace>` using the name in `apps/backend/package.json` (fallback `apps/backend`)
- `--start-db`: runs `docker compose up -d postgres` in `apps/backend`
- `--module <name>`: creates a Prisma file for that module
- `--prisma-version <semver>`: forces the Prisma version. Without this flag, the skill keeps the Prisma version already present in the backend (fallback `7.4.2`)

## After bootstrap

- Add real models in `prisma/models/*.model.prisma`
- Generate migrations (`prisma migrate dev`)
- Implement per-module seeds and register them in `prisma/seed/main.ts`
- Update `*.prisma.ts` adapters to map domain and DTO
- Remove `prisma/models/bootstrap.model.prisma` after real models exist, and generate a replacement migration
- On rebootstrap of older projects, the script automatically fixes a legacy `prisma/seed/main.ts` when it detects imports from `generated/client`, `generated/prisma`, or `cid`
- Prefer compatibility with the real structure of the current monorepo, and avoid depending on missing helper files
