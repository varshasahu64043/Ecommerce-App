Prisma setup for ecommerce-app

Commands

- pnpm prisma:generate or npm run prisma:generate: Generate Prisma Client
- pnpm prisma:migrate or npm run prisma:migrate: Run development migrations
- pnpm prisma:studio or npm run prisma:studio: Open Prisma Studio

Notes

- Ensure DATABASE_URL is set in .env to your Postgres/Neon database string.
- The schema aligns with the SQL in scripts/01-create-tables.sql and scripts/02-seed-data.sql.
