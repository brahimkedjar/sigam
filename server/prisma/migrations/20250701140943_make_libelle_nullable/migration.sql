/*
  Warnings:

  - You are about to drop the column `id_procedure` on the `DossierAdministratif` table. All the data in the column will be lost.
  - Added the required column `id_typeproc` to the `DossierAdministratif` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DossierAdministratif" DROP CONSTRAINT "DossierAdministratif_id_procedure_fkey";

-- AlterTable
ALTER TABLE "DossierAdministratif" DROP COLUMN "id_procedure",
ADD COLUMN     "id_typeproc" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "DossierAdministratif" ADD CONSTRAINT "DossierAdministratif_id_typeproc_fkey" FOREIGN KEY ("id_typeproc") REFERENCES "typeprocedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
