# Prisma Sync by Module

## Goal

Sync a single domain module with the backend Prisma layer, keeping the modular schema and incremental migrations aligned with the module entities.

## Main paths

- Domain modules:
  - `modules/<module>/src/**/*.entity.ts`
- Entity base:
  - `packages/shared/src/model/entity.ts`
- Root Prisma schema:
  - `apps/backend/prisma/schema.prisma`
- Prisma models per module:
  - `apps/backend/prisma/models/<module>.model.prisma`
- SQL migration:
  - `apps/backend/prisma/migrations/*/migration.sql`
- Prisma commands:
  - `apps/backend/package.json`

## Operational checklist

### 1. Read the module

- [ ] Confirm the module was stated explicitly by the user or by unambiguous context.
- [ ] If the module is not clear, stop and ask for the target module before continuing.
- [ ] Confirm the module name and path in `modules/<module>`.
- [ ] List the `*.entity.ts` entities.
- [ ] Identify classes that extend `Entity<TState>`.
- [ ] Extract `State` fields and the fields inherited from `EntityState`.

### 2. Update the Prisma schema

- [ ] Create or edit only `apps/backend/prisma/models/<module>.model.prisma`.
- [ ] Keep one Prisma model per persistable entity.
- [ ] Include `id`, `createdAt`, `updatedAt`, and `deletedAt` when they belong to the shared base.
- [ ] Keep names and types consistent with the domain.
- [ ] Review relations, nullability, and indexes only when the code makes them clear.

### 3. Generate the migration

- [ ] For the module's first migration, use `<module>`.
- [ ] For an incremental change, use `<module>-<short-suffix>`.
- [ ] Start the database if it is not available:
  - `npm --workspace apps/backend run db:start`
- [ ] Run the migration:
  - `npm --workspace apps/backend run prisma:migrate:dev -- --name <migration-name>`
- [ ] Generate the client:
  - `npm --workspace apps/backend run prisma:generate`

### 4. Validate the result

- [ ] Review the generated SQL when there is a rename, drop, type change, or nullability change.
- [ ] Confirm the module Prisma file matches the entities that were read.
- [ ] If the schema was already in sync, record that explicitly instead of forcing changes.

## Recommended conventions

- Keep one Prisma file per module.
- Name migrations in kebab-case.
- Use short, descriptive suffixes for incremental migrations.
- Preserve the language and code style already used by the project.
- Avoid unnecessary `@map` / `@@map`.

## Common pitfalls

- Inferring a module when the user has not said which module to sync.
- Ignoring fields inherited from `EntityState`.
- Creating a Prisma schema for classes that are not persistable entities.
- Inferring relations that are not clear in the domain.
- Naming a migration too generically, such as `update` or `fix`.
- Changing files in other modules without a need.
- Keeping `bootstrap.model.prisma` after the project already has enough real models to replace it.
