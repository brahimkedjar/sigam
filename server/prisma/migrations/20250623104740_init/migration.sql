/*
  Warnings:

  - You are about to drop the column `id_demande` on the `expertminier` table. All the data in the column will be lost.
  - Made the column `id_expert` on table `demande` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "expertminier" DROP CONSTRAINT "expertminier_id_demande_fkey";

-- DropIndex
DROP INDEX "expertminier_id_demande_key";

-- AlterTable
ALTER TABLE "demande" ALTER COLUMN "id_expert" SET NOT NULL;

-- AlterTable
ALTER TABLE "expertminier" DROP COLUMN "id_demande";

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_expert_fkey" FOREIGN KEY ("id_expert") REFERENCES "expertminier"("id_expert") ON DELETE RESTRICT ON UPDATE CASCADE;
