/*
  Warnings:

  - A unique constraint covering the columns `[lib_statut]` on the table `StatutPermis` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StatutPermis_lib_statut_key" ON "StatutPermis"("lib_statut");
