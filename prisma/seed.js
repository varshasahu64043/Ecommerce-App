// Seed using raw SQL file (scripts/02-seed-data.sql)
// Requires DATABASE_URL in env

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(__dirname, '..', 'scripts', '02-seed-data.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Remove full-line SQL comments starting with --, then split by semicolons
  const cleaned = sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleaned
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Execute all statements within a transaction for consistency
  await prisma.$transaction(async (tx) => {
    // Clean relevant tables and reset identity to match hard-coded category_ids in SQL (1..5)
    await tx.$executeRawUnsafe(
      'TRUNCATE TABLE "public"."products", "public"."categories" RESTART IDENTITY CASCADE;'
    );

    for (const stmt of statements) {
      const affected = await tx.$executeRawUnsafe(stmt);
      console.log(`Executed statement, affected rows: ${affected}`);
    }
  });

  // Verify counts
  const [categoriesCount, productsCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);
  console.log(`Categories: ${categoriesCount}, Products: ${productsCount}`);
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
