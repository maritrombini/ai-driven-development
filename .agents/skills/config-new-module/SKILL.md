---
name: config-new-module
description: Deterministically create a new business module under `modules/` in this monorepo from a module name and a required npm namespace, scaffold the matching NestJS module in `apps/backend/src/modules/<module-name>` with a controller and automatic registration in AppModule, and create the frontend module base at `apps/frontend/src/app/(private)/<module-name>/page.tsx`, `apps/frontend/src/modules/<module-name>/pages/<module-name>.page.tsx`, and `apps/frontend/src/modules/<module-name>/components/<module-name>.component.tsx`. Use when scaffolding a workspace such as `modules/auth`, copying this skill's fixed templates, registering the module dependency in `apps/frontend` and `apps/backend`, ensuring `ts-node` and `modules/*` in the root `package.json`, installing dependencies, building the project, and running tests for the newly created module.
---

# Config New Module

Use the script `scripts/create-module.js` instead of recreating the structure by hand.

## Flow

1. Confirm the request explicitly states the `module name` and `namespace`.
2. Do not continue without a namespace.
3. Run from the project root:

```bash
node .agents/skills/config-new-module/scripts/create-module.js --module auth --namespace @piggy
```

4. At the end, verify:
   - `modules/<module-name>` was created.
   - `apps/backend/src/modules/<module-name>/<module-name>.module.ts` was created.
   - `apps/backend/src/modules/<module-name>/<module-name>.controller.ts` was created.
   - `apps/frontend/src/app/(private)/<module-name>/page.tsx` was created.
   - `apps/frontend/src/modules/<module-name>/pages/<module-name>.page.tsx` was created.
   - `apps/frontend/src/modules/<module-name>/components/<module-name>.component.tsx` was created.
   - `apps/backend/src/app.module.ts` imports and registers `<ModuleName>Module`.
   - `apps/frontend/package.json` and `apps/backend/package.json` contain `@namespace/<module-name>`.
   - The root `package.json` contains `ts-node` in `devDependencies`.
   - The root `package.json` contains `modules/*` in `workspaces`.
   - `npm install`, `npm run build`, and `npm run test --workspace @namespace/<module-name>` succeeded.

## Behavior

- Create `modules/` if it does not exist yet.
- Refuse to run when `--namespace` is missing.
- Refuse to run when `modules/<module-name>` already exists.
- Refuse to run when `apps/backend/src/modules/<module-name>` already exists.
- Refuse to run when `apps/frontend/src/modules/<module-name>` or `apps/frontend/src/app/(private)/<module-name>` already exists.
- Copy files from `assets/module-template/` and replace placeholders with the given module name and namespace.
- Copy files from `assets/nestjs-module-template/` into `apps/backend/src/modules/<module-name>/`, replacing `__MODULE_NAME__` and `__MODULE_CLASS_NAME__` (PascalCase of the name).
- Copy files from `assets/frontend-module-template/` into `apps/frontend/src/`, replacing `__MODULE_NAME__`, `__MODULE_CLASS_NAME__` (PascalCase), and `__MODULE_DISPLAY_NAME__` (Title Case).
- Add the import and registration of `<ModuleName>Module` in `apps/backend/src/app.module.ts`.
- Ensure the module dependency in `apps/frontend/package.json` and `apps/backend/package.json`.
- Ensure `ts-node@^10.9.2` in the root `package.json`.
- Ensure `apps/*`, `modules/*`, and `packages/*` in `workspaces`, keeping any extra entries that already exist.
- Preserve unrelated files.

## Templates

Workspace base files live in `assets/module-template/`:

- `jest.config.ts`
- `package.json`
- `tsconfig.json`
- `src/index.ts`
- `test/index.test.ts`

NestJS module base files live in `assets/nestjs-module-template/`:

- `module.ts` is copied as `<module-name>.module.ts`
- `controller.ts` is copied as `<module-name>.controller.ts`

Frontend base files live in `assets/frontend-module-template/`:

- `route-page.tsx` is copied as `app/(private)/<module-name>/page.tsx`
- `page.tsx` is copied as `modules/<module-name>/pages/<module-name>.page.tsx`
- `component.tsx` is copied as `modules/<module-name>/components/<module-name>.component.tsx`

Placeholders replaced in NestJS templates: `__MODULE_NAME__` (kebab-case) and `__MODULE_CLASS_NAME__` (PascalCase).
Placeholders replaced in frontend templates: `__MODULE_NAME__` (kebab-case), `__MODULE_CLASS_NAME__` (PascalCase), and `__MODULE_DISPLAY_NAME__` (Title Case).

Edit those files before running the script only when the default template itself needs to change.

## Constraints

- Do not infer a namespace when the request does not include one.
- Do not skip `npm install`, `npm run build`, or the test of the created workspace.
- Do not create extra documentation outside this skill's own resources.
