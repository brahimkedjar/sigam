/*
  Warnings:

  - You are about to drop the `RegistreCommerce` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RegistreCommerce" DROP CONSTRAINT "RegistreCommerce_id_detenteur_fkey";

-- DropTable
DROP TABLE "RegistreCommerce";

-- CreateTable
CREATE TABLE "registrecommerce" (
    "id" SERIAL NOT NULL,
    "id_detenteur" INTEGER NOT NULL,
    "numero_rc" TEXT NOT NULL,
    "date_enregistrement" TIMESTAMP(3) NOT NULL,
    "capital_social" DOUBLE PRECISION NOT NULL,
    "nis" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "adresse_legale" TEXT NOT NULL,

    CONSTRAINT "registrecommerce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registrecommerce_id_detenteur_key" ON "registrecommerce"("id_detenteur");

-- AddForeignKey
ALTER TABLE "registrecommerce" ADD CONSTRAINT "registrecommerce_id_detenteur_fkey" FOREIGN KEY ("id_detenteur") REFERENCES "detenteurmorale"("id_detenteur") ON DELETE RESTRICT ON UPDATE CASCADE;
