/*
  Warnings:

  - You are about to drop the column `nationalité` on the `personnephysique` table. All the data in the column will be lost.
  - You are about to drop the column `num_carte_identité` on the `personnephysique` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[num_carte_identite]` on the table `personnephysique` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nationalite` to the `personnephysique` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_carte_identite` to the `personnephysique` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "personnephysique_num_carte_identité_key";

-- AlterTable
ALTER TABLE "personnephysique" DROP COLUMN "nationalité",
DROP COLUMN "num_carte_identité",
ADD COLUMN     "nationalite" TEXT NOT NULL,
ADD COLUMN     "num_carte_identite" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "personnephysique_num_carte_identite_key" ON "personnephysique"("num_carte_identite");
