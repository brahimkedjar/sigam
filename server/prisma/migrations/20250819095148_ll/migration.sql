/*
  Warnings:

  - You are about to drop the column `id_droit` on the `typepermis` table. All the data in the column will be lost.
  - You are about to drop the column `id_droit` on the `typeprocedure` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "typepermis" DROP CONSTRAINT "typepermis_id_droit_fkey";

-- DropForeignKey
ALTER TABLE "typeprocedure" DROP CONSTRAINT "typeprocedure_id_droit_fkey";

-- AlterTable
ALTER TABLE "typepermis" DROP COLUMN "id_droit",
ADD COLUMN     "baremId" INTEGER;

-- AlterTable
ALTER TABLE "typeprocedure" DROP COLUMN "id_droit",
ADD COLUMN     "baremId" INTEGER;

-- AddForeignKey
ALTER TABLE "typepermis" ADD CONSTRAINT "typepermis_baremId_fkey" FOREIGN KEY ("baremId") REFERENCES "barem_produit_droit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "typeprocedure" ADD CONSTRAINT "typeprocedure_baremId_fkey" FOREIGN KEY ("baremId") REFERENCES "barem_produit_droit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
