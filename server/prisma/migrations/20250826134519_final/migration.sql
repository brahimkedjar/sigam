/*
  Warnings:

  - You are about to drop the column `adresse_siège` on the `detenteurmorale` table. All the data in the column will be lost.
  - You are about to drop the column `nationalité` on the `detenteurmorale` table. All the data in the column will be lost.
  - Added the required column `adresse_siege` to the `detenteurmorale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationalite` to the `detenteurmorale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "detenteurmorale" DROP COLUMN "adresse_siège",
DROP COLUMN "nationalité",
ADD COLUMN     "adresse_siege" TEXT NOT NULL,
ADD COLUMN     "nationalite" TEXT NOT NULL,
ALTER COLUMN "fax" DROP NOT NULL,
ALTER COLUMN "site_web" DROP NOT NULL;
