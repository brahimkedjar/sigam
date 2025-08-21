-- DropForeignKey
ALTER TABLE "typepermis" DROP CONSTRAINT "typepermis_id_droit_fkey";

-- DropForeignKey
ALTER TABLE "typepermis" DROP CONSTRAINT "typepermis_id_taxe_fkey";

-- AlterTable
ALTER TABLE "typepermis" ALTER COLUMN "id_droit" DROP NOT NULL,
ALTER COLUMN "id_taxe" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "typepermis" ADD CONSTRAINT "typepermis_id_droit_fkey" FOREIGN KEY ("id_droit") REFERENCES "barem_produit_droit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typepermis" ADD CONSTRAINT "typepermis_id_taxe_fkey" FOREIGN KEY ("id_taxe") REFERENCES "superficiaire_bareme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
