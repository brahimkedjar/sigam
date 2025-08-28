/*
  Warnings:

  - You are about to drop the column `description` on the `Antenne` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Antenne" DROP COLUMN "description",
ADD COLUMN     "localisation" TEXT;

-- CreateTable
CREATE TABLE "Wilaya" (
    "id_wilaya" SERIAL NOT NULL,
    "id_antenne" INTEGER NOT NULL,
    "code_wilaya" TEXT NOT NULL,
    "nom_wilayaFR" TEXT NOT NULL,

    CONSTRAINT "Wilaya_pkey" PRIMARY KEY ("id_wilaya")
);

-- CreateTable
CREATE TABLE "Daira" (
    "id_daira" SERIAL NOT NULL,
    "id_wilaya" INTEGER NOT NULL,
    "code_daira" TEXT NOT NULL,
    "nom_dairaFR" TEXT NOT NULL,

    CONSTRAINT "Daira_pkey" PRIMARY KEY ("id_daira")
);

-- CreateTable
CREATE TABLE "Commune" (
    "id_commune" SERIAL NOT NULL,
    "id_daira" INTEGER NOT NULL,
    "code_commune" TEXT NOT NULL,
    "nom_communeFR" TEXT NOT NULL,

    CONSTRAINT "Commune_pkey" PRIMARY KEY ("id_commune")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wilaya_code_wilaya_key" ON "Wilaya"("code_wilaya");

-- CreateIndex
CREATE UNIQUE INDEX "Daira_code_daira_key" ON "Daira"("code_daira");

-- CreateIndex
CREATE UNIQUE INDEX "Commune_code_commune_key" ON "Commune"("code_commune");

-- AddForeignKey
ALTER TABLE "Wilaya" ADD CONSTRAINT "Wilaya_id_antenne_fkey" FOREIGN KEY ("id_antenne") REFERENCES "Antenne"("id_antenne") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Daira" ADD CONSTRAINT "Daira_id_wilaya_fkey" FOREIGN KEY ("id_wilaya") REFERENCES "Wilaya"("id_wilaya") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commune" ADD CONSTRAINT "Commune_id_daira_fkey" FOREIGN KEY ("id_daira") REFERENCES "Daira"("id_daira") ON DELETE RESTRICT ON UPDATE CASCADE;
