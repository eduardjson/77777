-- AlterTable
ALTER TABLE "stock_items" ADD COLUMN     "discount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "estimate_price" DOUBLE PRECISION,
ADD COLUMN     "purchase_price" DOUBLE PRECISION,
ADD COLUMN     "sale_price" DOUBLE PRECISION;
