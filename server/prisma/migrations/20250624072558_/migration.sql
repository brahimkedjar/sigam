/*
  Warnings:

  - A unique constraint covering the columns `[id_comite,id_membre]` on the table `MembresCD` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MembresCD_id_comite_id_membre_key" ON "MembresCD"("id_comite", "id_membre");
