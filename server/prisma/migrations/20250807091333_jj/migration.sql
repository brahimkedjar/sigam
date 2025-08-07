/*
  Warnings:

  - The primary key for the `statutjuridique` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id_statutJuridique]` on the table `statutjuridique` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id_statutJuridique` on the `detenteurmorale` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id_statutJuridique` on the `statutjuridique` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "detenteurmorale" DROP CONSTRAINT "detenteurmorale_id_statutJuridique_fkey";

-- AlterTable
ALTER TABLE "detenteurmorale" DROP COLUMN "id_statutJuridique",
ADD COLUMN     "id_statutJuridique" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "statutjuridique" DROP CONSTRAINT "statutjuridique_pkey",
DROP COLUMN "id_statutJuridique",
ADD COLUMN     "id_statutJuridique" INTEGER NOT NULL,
ADD CONSTRAINT "statutjuridique_pkey" PRIMARY KEY ("id_statutJuridique");

-- CreateIndex
CREATE UNIQUE INDEX "statutjuridique_id_statutJuridique_key" ON "statutjuridique"("id_statutJuridique");

-- AddForeignKey
ALTER TABLE "detenteurmorale" ADD CONSTRAINT "detenteurmorale_id_statutJuridique_fkey" FOREIGN KEY ("id_statutJuridique") REFERENCES "statutjuridique"("id_statutJuridique") ON DELETE RESTRICT ON UPDATE CASCADE;
