/*
  Warnings:

  - A unique constraint covering the columns `[libelle]` on the table `TypeDoc` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TypeDoc_libelle_key" ON "TypeDoc"("libelle");
