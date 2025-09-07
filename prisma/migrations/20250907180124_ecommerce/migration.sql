-- AlterTable
ALTER TABLE "public"."cart_items" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."products" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
