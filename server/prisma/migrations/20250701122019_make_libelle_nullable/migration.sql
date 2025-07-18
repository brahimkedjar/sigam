/*
  Warnings:

  - You are about to drop the column `code` on the `typeprocedure` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lib_type]` on the table `typepermis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code_type]` on the table `typepermis` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_typePermis` to the `DossierAdministratif` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DossierAdministratif" ADD COLUMN     "id_typePermis" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "typeprocedure" DROP COLUMN "code";

-- CreateIndex
CREATE UNIQUE INDEX "typepermis_lib_type_key" ON "typepermis"("lib_type");

-- CreateIndex
CREATE UNIQUE INDEX "typepermis_code_type_key" ON "typepermis"("code_type");

-- AddForeignKey
ALTER TABLE "DossierAdministratif" ADD CONSTRAINT "DossierAdministratif_id_typePermis_fkey" FOREIGN KEY ("id_typePermis") REFERENCES "typepermis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
