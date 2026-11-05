---
name: backend-prisma-repository
description: 'Create the Prisma implementation of a domain repository interface inside the NestJS backend. Use when the request explicitly names a repository interface in `modules/<module>/src/**`, generate the matching `*.prisma.ts` file directly in `apps/backend/src/modules/<module>` by default, register the concrete class in the Nest module with `DbModule` and `PrismaService`, and wire basic database operations such as `create`, `update`, `delete`, `findById`, and `findPage`.'
---

# Backend Prisma Repository

## Goal

Implement, in the NestJS backend, the Prisma version of a repository interface defined in a business module under `modules/`.
This skill works on a single contract per run. It must create the `*.prisma.ts` implementation, register the concrete class in the matching Nest module, and use the `PrismaService` provided by `DbModule`.

## Required gate

- Run this skill only when the target repository interface is stated explicitly.
- Accepted inputs:
  - the exact interface name, such as `UserRepository`, when the context points unambiguously to a single file
  - the interface file path, such as `modules/auth/src/user/provider/user.repository.ts`
  - an equivalent reference that identifies a single repository contract
- If the interface is missing or more than one file matches, stop immediately.
- Ask the user which repository interface to implement.
- Without that information, do not read files to infer a match, do not edit files, and do not register providers.
- This skill must not modify the repository interface file or any other file in the domain module under `modules/<module>/src/**`.
- This skill must not add, remove, or change exports, tokens, types, methods, imports, or any other part of the original interface.

## Scope

- Read the given interface inside `modules/<module>/src/**`.
- Infer the module from the real file path `modules/<module>/...`.
- Create the Prisma implementation inside `apps/backend/src/modules/<module>`.
- By default, create the file at the root of the backend module. Do not mirror domain subfolders unless the user explicitly asks for another layout.
- Change only the matching Nest module and the minimum backend files required for dependency injection.
- Never edit the original repository contract as part of this skill.

## Required conventions

- The implementation file must end with `.prisma.ts`.
- The file name follows the repository name, dropping the `.repository` suffix when it exists.
  - Example: `user.repository.ts` becomes `user.prisma.ts`.
- The backend path is, by default, the root of the backend module.
  - Example: `modules/auth/src/user/provider/user.repository.ts`
  - Default destination: `apps/backend/src/modules/auth/user.prisma.ts`
- Create subfolders only when the user asks for them, or when an existing local convention is required to keep the module working.
- The concrete class follows `Prisma<InterfaceName>`.
  - Example: `PrismaUserRepository implements UserRepository`
- The implementation injects `PrismaService` through the constructor.
- The backend Nest module must import `DbModule`.
- The Nest module must register the concrete Prisma class in `providers`.
- When the module must expose this repository to other Nest modules, export the concrete class itself.

## Workflow

1. Validate the required input.
   - Confirm there is exactly one target interface.
   - Confirm the file belongs to `modules/<module>/src/`.
   - If that fails, stop.
2. Read the contract and the minimum context.
   - Open the interface file.
   - Read the related types needed to implement the contract safely.
   - When the interface extends `CrudRepository`, read the generics and the entity, input, and paging types.
3. Resolve destinations and names.
   - Resolve the module from the path `modules/<module>`.
   - Resolve the backend module at `apps/backend/src/modules/<module>/<module>.module.ts`.
   - Resolve the Prisma file destination at the backend module root by default.
   - If the user specifies another path, follow that instruction.
4. Implement the Prisma class.
   - Create the `*.prisma.ts` file in the backend.
   - Inject `PrismaService`.
   - Implement the methods required by the contract.
   - If the interface extends `CrudRepository`, implement at least `create`, `update`, `delete`, `findById`, and `findPage`.
5. Connect it to Nest.
   - Update `apps/backend/src/modules/<module>/<module>.module.ts`.
   - Add `DbModule` to `imports`.
   - Register `Prisma<InterfaceName>` directly in `providers`.
   - Export `Prisma<InterfaceName>` when the backend module must make the repository available to other modules.
6. Review consumers.
   - In Nest classes, prefer injecting the concrete class, for example `constructor(private readonly userRepository: PrismaUserRepository)`.
   - When a domain use case depends on the interface, pass the concrete class into that use case without changing the domain contract.
   - Do not change pure domain classes that are outside the Nest injection graph.
7. Report the result.
   - State the implemented interface, the inferred module, the files created or changed, and anything that needs a manual review.

## Implementation rule

- Prefer contracts that extend `CrudRepository`.
- Map `findPage` to `PageResult<T>`, keeping `items`, `page`, `perPage`, and `total`.
- Reuse the Prisma model already present on the client when it is clearly defined.
- When the Prisma model name cannot be inferred safely from the entity or the existing schema, stop and ask for confirmation instead of inventing the access.
- TypeScript interfaces stay useful as the domain contract, but Nest injection uses the concrete class by default and does not require a symbol token.
- Do not put business rules in the Prisma implementation. Keep it limited to persistence and mapping.
- If the entity needs conversion between the domain model and the Prisma payload, add private mapping methods in the same file.
- If the entity has a constructor or factory that must rehydrate the domain, follow that business module instead of returning object literals.

## Database integration

- The implementation depends on `PrismaService` imported from `apps/backend/src/db/prisma.service`.
- The backend module depends on `DbModule` imported from `apps/backend/src/db/db.module`.
- Do not instantiate `PrismaClient` directly inside the Prisma repository.
- Do not duplicate connection configuration outside the existing database module.

## Guardrails

- Do not run without an explicitly named repository interface.
- Do not infer a module without a unique path or contract.
- Do not modify the target interface file or any domain file in `modules/<module>/src/**`.
- Do not edit other backend modules beyond what the target repository needs.
- Do not change the Prisma schema, migrations, seeds, or domain entities as part of this skill unless the request explicitly includes that work.
- Do not require a symbol token by default for the implementation to work in the backend.
- Do not create subfolders in the backend module without a need or an explicit user request.
- If the contract cannot be implemented with basic Prisma operations alone, report the gap before continuing.

## Expected output

- Prisma implementation created at `apps/backend/src/modules/<module>/<name>.prisma.ts` by default.
- Nest module updated with `DbModule` and the Prisma class registered in `providers`.
- Nest consumers updated to inject the concrete class when that fits the backend.

## References

- See `references/prisma-repository-implementation.md` for the detailed checklist, path conventions, and a concrete `UserRepository` example.
