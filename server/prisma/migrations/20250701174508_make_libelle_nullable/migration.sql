/*
  Warnings:

  - A unique constraint covering the columns `[id_typePermis,id_typeproc]` on the table `DossierAdministratif` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DossierAdministratif_id_typePermis_id_typeproc_key" ON "DossierAdministratif"("id_typePermis", "id_typeproc");
