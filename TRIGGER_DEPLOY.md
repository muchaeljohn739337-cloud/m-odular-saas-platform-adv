# Trigger Backend Redeploy to Create Database Tables

The database connection is working, but tables need to be created.
This commit will trigger a redeploy that should run `prisma db push` to create all tables.

Backend build command: `cd backend && npm ci && npm run build`
Which runs: `tsc && prisma generate && prisma db push --accept-data-loss --skip-generate`

This should create the users table and all other required tables in PostgreSQL.