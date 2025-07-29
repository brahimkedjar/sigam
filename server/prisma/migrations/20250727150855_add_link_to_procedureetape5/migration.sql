/*
  Warnings:

  - You are about to drop the column `decision_comite` on the `ComiteDirection` table. All the data in the column will be lost.
  - You are about to drop the column `id_procedure` on the `ComiteDirection` table. All the data in the column will be lost.
  - You are about to drop the column `motif` on the `ComiteDirection` table. All the data in the column will be lost.
  - You are about to drop the `_ComiteMembres` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_seance]` on the table `ComiteDirection` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_seance` to the `ComiteDirection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_seance` to the `procedure` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ComiteDirection" DROP CONSTRAINT "ComiteDirection_id_procedure_fkey";

-- DropForeignKey
ALTER TABLE "_ComiteMembres" DROP CONSTRAINT "_ComiteMembres_A_fkey";

-- DropForeignKey
ALTER TABLE "_ComiteMembres" DROP CONSTRAINT "_ComiteMembres_B_fkey";

-- AlterTable
ALTER TABLE "ComiteDirection" DROP COLUMN "decision_comite",
DROP COLUMN "id_procedure",
DROP COLUMN "motif",
ADD COLUMN     "id_seance" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "procedure" ADD COLUMN     "id_seance" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_ComiteMembres";

-- CreateTable
CREATE TABLE "SeanceCDPrevue" (
    "id_seance" SERIAL NOT NULL,
    "num_seance" TEXT NOT NULL,
    "date_seance" TIMESTAMP(3) NOT NULL,
    "exercice" INTEGER NOT NULL,
    "remarques" TEXT,

    CONSTRAINT "SeanceCDPrevue_pkey" PRIMARY KEY ("id_seance")
);

-- CreateTable
CREATE TABLE "DecisionCD" (
    "id_decision" SERIAL NOT NULL,
    "id_comite" INTEGER NOT NULL,
    "decision_cd" "EnumDecisionComite" NOT NULL,
    "duree_decision" INTEGER,
    "commentaires" TEXT,

    CONSTRAINT "DecisionCD_pkey" PRIMARY KEY ("id_decision")
);

-- CreateTable
CREATE TABLE "_SeanceMembres" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SeanceMembres_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SeanceMembres_B_index" ON "_SeanceMembres"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ComiteDirection_id_seance_key" ON "ComiteDirection"("id_seance");

-- AddForeignKey
ALTER TABLE "procedure" ADD CONSTRAINT "procedure_id_seance_fkey" FOREIGN KEY ("id_seance") REFERENCES "SeanceCDPrevue"("id_seance") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComiteDirection" ADD CONSTRAINT "ComiteDirection_id_seance_fkey" FOREIGN KEY ("id_seance") REFERENCES "SeanceCDPrevue"("id_seance") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionCD" ADD CONSTRAINT "DecisionCD_id_comite_fkey" FOREIGN KEY ("id_comite") REFERENCES "ComiteDirection"("id_comite") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeanceMembres" ADD CONSTRAINT "_SeanceMembres_A_fkey" FOREIGN KEY ("A") REFERENCES "MembresComite"("id_membre") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeanceMembres" ADD CONSTRAINT "_SeanceMembres_B_fkey" FOREIGN KEY ("B") REFERENCES "SeanceCDPrevue"("id_seance") ON DELETE CASCADE ON UPDATE CASCADE;
