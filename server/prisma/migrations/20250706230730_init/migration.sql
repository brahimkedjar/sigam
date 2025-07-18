/*
  Warnings:

  - A unique constraint covering the columns `[num_carte_identité]` on the table `personnephysique` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "personnephysique_num_carte_identité_key" ON "personnephysique"("num_carte_identité");
