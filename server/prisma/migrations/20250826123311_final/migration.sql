-- AlterTable
ALTER TABLE "demande" ADD COLUMN     "capital_social_disponible" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "substances" ALTER COLUMN "famille_sub" DROP NOT NULL;
