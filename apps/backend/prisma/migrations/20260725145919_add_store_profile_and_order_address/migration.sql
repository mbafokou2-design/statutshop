-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_address" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "city" TEXT DEFAULT 'Douala',
ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "neighborhood" TEXT DEFAULT 'Centre-ville';
