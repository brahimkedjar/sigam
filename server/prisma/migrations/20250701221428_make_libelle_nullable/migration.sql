/*
  Warnings:

  - Added the required column `id_typePermis` to the `demande` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "demande" ADD COLUMN     "id_typePermis" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_typePermis_fkey" FOREIGN KEY ("id_typePermis") REFERENCES "typepermis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
