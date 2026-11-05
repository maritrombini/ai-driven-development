# Piggy

Personal finance monorepo for accounts, transactions, and reports.

## Workspace

- `apps/frontend` (`@piggy/frontend`): Next.js app
- `apps/backend` (`@piggy/backend`): NestJS API
- `modules/auth` (`@piggy/auth`): user registration domain
- `modules/transactions` (`@piggy/transactions`): transactions domain
- `modules/reports` (`@piggy/reports`): reports domain
- `packages/shared` (`@piggy/shared`): entities, use cases, validation, and errors

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run check-types
```

Start Postgres for the backend:

```bash
npm --workspace @piggy/backend run db:start
```

The database defaults live in `apps/backend/.env.example`. Local user and database name are both `piggy`.
