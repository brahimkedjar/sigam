/*
  Warnings:

  - You are about to drop the `_ProcedureDetenteurs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProcedureDetenteurs" DROP CONSTRAINT "_ProcedureDetenteurs_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProcedureDetenteurs" DROP CONSTRAINT "_ProcedureDetenteurs_B_fkey";

-- AlterTable
ALTER TABLE "demande" ADD COLUMN     "id_detenteur" INTEGER;

-- DropTable
DROP TABLE "_ProcedureDetenteurs";

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_detenteur_fkey" FOREIGN KEY ("id_detenteur") REFERENCES "detenteurmorale"("id_detenteur") ON DELETE SET NULL ON UPDATE CASCADE;
