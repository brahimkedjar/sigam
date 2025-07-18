/*
  Warnings:

  - Added the required column `rc` to the `detenteurmorale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "detenteurmorale" ADD COLUMN     "rc" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RegistreCommerce" (
    "id" SERIAL NOT NULL,
    "id_detenteur" INTEGER NOT NULL,
    "numero_rc" TEXT NOT NULL,
    "date_enregistrement" TIMESTAMP(3) NOT NULL,
    "capital_social" DOUBLE PRECISION NOT NULL,
    "nis" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "adresse_legale" TEXT NOT NULL,

    CONSTRAINT "RegistreCommerce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistreCommerce_id_detenteur_key" ON "RegistreCommerce"("id_detenteur");

-- AddForeignKey
ALTER TABLE "RegistreCommerce" ADD CONSTRAINT "RegistreCommerce_id_detenteur_fkey" FOREIGN KEY ("id_detenteur") REFERENCES "detenteurmorale"("id_detenteur") ON DELETE RESTRICT ON UPDATE CASCADE;
