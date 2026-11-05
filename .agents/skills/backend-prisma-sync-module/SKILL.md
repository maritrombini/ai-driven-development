---
name: backend-prisma-sync-module
description: 'Sync a domain module with the backend Prisma schema. Use when the request is to analyze entities in `modules/<module>/src`, create or update `apps/backend/prisma/models/<module>.model.prisma`, generate an incremental migration named after the module, apply the migration, and keep the Prisma schema aligned with entities that extend `Entity`.'
---

# Backend Sync Module Prisma

## Goal

Sync only the Prisma persistence structure of one monorepo module from the entities declared in `modules/<module>`.
This skill receives a module, analyzes classes that extend `Entity<TState>`, creates or updates the matching Prisma file at `apps/backend/prisma/models/<module>.model.prisma`, creates an incremental migration named after the module, runs the migration, and keeps the database aligned with the current module.
Continue only when the target module is stated explicitly by the user or by the immediate task context.

Do not create DTOs, Prisma adapters, repositories, seeds, controllers, or use cases unless the request explicitly asks for that outside this skill.
Generated files and code must follow the language, conventions, and style already used in the project.

## When to use

- When the request is to sync a module's entities with Prisma.
- When entities are created or changed in `modules/<module>` and that change must become schema and a migration.
- When the Prisma schema of a module may be out of date relative to the domain.
- When an incremental migration should focus on a single module.

## Read scope

- Read the given module in `modules/<module>`.
- Look for entities in `**/*.entity.ts` files.
- Prefer classes `class Xxx extends Entity<...>`.
- Read the `State` associated with each entity to discover the fields the domain persists.
- Include the fields inherited from `EntityState` in `packages/shared/src/model/entity.ts`:
  - `id?: string`
  - `createdAt?: Date`
  - `updatedAt?: Date`
  - `deletedAt?: Date | null`

## Required gate

- Before any read, schema edit, or migration, check that a target module is clearly identified.
- Valid inputs:
  - the module name, such as `auth`
  - the module path inside `modules/`
  - unambiguous context that points to a single module already cited in the current task
- If the module was not stated clearly, stop immediately.
- Ask the user which module to sync in the backend Prisma schema.
- Without that information, do not infer a module, do not edit files, and do not run Prisma commands.

## Workflow

1. Resolve the target module.
   - First check whether the module was stated explicitly or unambiguously.
   - If it was not, stop immediately and ask for the module name to sync.
   - Accept a module name, a path inside `modules/`, or an equivalent context.
   - Normalize to the real folder name and the Prisma file name `<module>.model.prisma`.
2. Map the persistable domain.
   - Read every entity in the module.
   - List the fields declared in each entity `State`.
   - Also include the fields inherited from `EntityState`.
   - Identify relations only when they are clear in the module code.
3. Update the module Prisma schema.
   - Create or edit only `apps/backend/prisma/models/<module>.model.prisma`.
   - Keep one Prisma model per persistable domain entity.
   - Keep the modular Prisma layout: each module stays in its own file.
   - Keep the Prisma model name aligned with the domain entity, and map the physical table to lowercase `snake_case`, preferably plural.
   - Use `@@map("<table_name>")` whenever needed to enforce that database pattern. Example: entity `User` -> model `User` with `@@map("users")`.
   - Remove `apps/backend/prisma/models/bootstrap.model.prisma` when the first real domain model lands and the bootstrap file is no longer needed.
4. Generate an incremental migration.
   - For the first sync of the module, name the migration after the module in kebab-case.
   - If the module already exists in Prisma and there are differences, create a new migration named `<module>-<short-suffix>`.
   - The suffix should describe the change briefly, for example: `auth-add-user-table`, `auth-add-user-deleted-at`, `transactions-rename-status`.
5. Apply and validate.
   - Make sure the database is available before the migration.
   - Run `npm --workspace apps/backend run prisma:migrate:dev -- --name <migration-name>`.
   - Run `npm --workspace apps/backend run prisma:generate`.
   - Review the generated SQL when there is a risk of a destructive change.
6. Report the result.
   - State the entities analyzed, the Prisma file changed, the migration name, and any assumption made.
   - If there is no difference between the module and the schema, say explicitly that the module was already in sync.

## Mapping rules

- Assume each persistable entity must reflect the fields of its `State`.
- Always include the base fields inherited from `EntityState`.
- For database table names, use lowercase `snake_case`, preferably plural.
- When the entity or model name is singular or PascalCase, keep the idiomatic Prisma model name and map the table with `@@map`. Examples:
  - `User` -> `@@map("users")`
  - `UserProfile` -> `@@map("user_profiles")`
- Map primitive types conservatively:
  - `string` -> `String`
  - `boolean` -> `Boolean`
  - `Date` -> `DateTime`
  - `number` -> choose `Int`, `BigInt`, or `Decimal` only when the context makes that clear
- If numeric type, cardinality, nullability, enum, or relation is ambiguous, state the question before locking in a destructive schema.
- Use `@map` and `@@map` only when existing naming or an existing database actually requires them.
- Do not infer structures that do not appear in the module. If a relation is not clear in the domain, do not invent it.

## Guardrails

- Do not continue without an explicitly identified target module.
- Do not change other Prisma modules unless the global schema requires it.
- Do not touch seeds or persistence adapters as part of this skill's default flow.
- Do not overwrite old migrations.
- Treat a field rename, column removal, type change, or nullability change as a risky change and review the generated SQL carefully.
- If the module has no entity that extends `Entity`, say there is not enough basis for automatic sync.

## Base commands

- Start the database when needed:
  - `npm --workspace apps/backend run db:start`
- Generate and apply the module migration:
  - `npm --workspace apps/backend run prisma:migrate:dev -- --name <migration-name>`
- Refresh the Prisma client:
  - `npm --workspace apps/backend run prisma:generate`

## References

- See `references/module-prisma-sync.md` for the operational checklist and common pitfalls.
