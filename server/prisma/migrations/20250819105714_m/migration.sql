/*
  Warnings:

  - You are about to drop the column `baremId` on the `typepermis` table. All the data in the column will be lost.
  - You are about to drop the column `baremId` on the `typeprocedure` table. All the data in the column will be lost.
  - Added the required column `typePermisId` to the `barem_produit_droit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeProcedureId` to the `barem_produit_droit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "typepermis" DROP CONSTRAINT "typepermis_baremId_fkey";

-- DropForeignKey
ALTER TABLE "typeprocedure" DROP CONSTRAINT "typeprocedure_baremId_fkey";

-- AlterTable
ALTER TABLE "barem_produit_droit" ADD COLUMN     "typePermisId" INTEGER NOT NULL,
ADD COLUMN     "typeProcedureId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "typepermis" DROP COLUMN "baremId";

-- AlterTable
ALTER TABLE "typeprocedure" DROP COLUMN "baremId";

-- AddForeignKey
ALTER TABLE "barem_produit_droit" ADD CONSTRAINT "barem_produit_droit_typePermisId_fkey" FOREIGN KEY ("typePermisId") REFERENCES "typepermis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barem_produit_droit" ADD CONSTRAINT "barem_produit_droit_typeProcedureId_fkey" FOREIGN KEY ("typeProcedureId") REFERENCES "typeprocedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
