/*
  Warnings:

  - Made the column `id_typeproc` on table `demande` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_taxe` on table `typepermis` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "demande" DROP CONSTRAINT "demande_id_typeproc_fkey";

-- DropForeignKey
ALTER TABLE "typepermis" DROP CONSTRAINT "typepermis_id_taxe_fkey";

-- AlterTable
ALTER TABLE "demande" ALTER COLUMN "id_typeproc" SET NOT NULL;

-- AlterTable
ALTER TABLE "typepermis" ALTER COLUMN "id_taxe" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "typepermis" ADD CONSTRAINT "typepermis_id_taxe_fkey" FOREIGN KEY ("id_taxe") REFERENCES "superficiaire_bareme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_typeproc_fkey" FOREIGN KEY ("id_typeproc") REFERENCES "typeprocedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
