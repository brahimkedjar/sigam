-- DropForeignKey
ALTER TABLE "typeprocedure" DROP CONSTRAINT "typeprocedure_id_droit_fkey";

-- AlterTable
ALTER TABLE "typeprocedure" ALTER COLUMN "id_droit" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "typeprocedure" ADD CONSTRAINT "typeprocedure_id_droit_fkey" FOREIGN KEY ("id_droit") REFERENCES "barem_produit_droit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
