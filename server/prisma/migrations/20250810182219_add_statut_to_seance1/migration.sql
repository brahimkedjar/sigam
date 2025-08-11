/*
  Warnings:

  - You are about to drop the `_SeanceProcedures` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procedure` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InteractionWali" DROP CONSTRAINT "InteractionWali_id_procedure_fkey";

-- DropForeignKey
ALTER TABLE "ProcedureCoord" DROP CONSTRAINT "ProcedureCoord_id_proc_fkey";

-- DropForeignKey
ALTER TABLE "ProcedureRenouvellement" DROP CONSTRAINT "ProcedureRenouvellement_id_proc_fkey";

-- DropForeignKey
ALTER TABLE "_PermisProcedure" DROP CONSTRAINT "_PermisProcedure_B_fkey";

-- DropForeignKey
ALTER TABLE "_SeanceProcedures" DROP CONSTRAINT "_SeanceProcedures_A_fkey";

-- DropForeignKey
ALTER TABLE "_SeanceProcedures" DROP CONSTRAINT "_SeanceProcedures_B_fkey";

-- DropForeignKey
ALTER TABLE "demande" DROP CONSTRAINT "demande_id_proc_fkey";

-- DropForeignKey
ALTER TABLE "procedure" DROP CONSTRAINT "procedure_id_typeproc_fkey";

-- DropForeignKey
ALTER TABLE "procedure_etape" DROP CONSTRAINT "procedure_etape_id_proc_fkey";

-- DropForeignKey
ALTER TABLE "substance_associee_demande" DROP CONSTRAINT "substance_associee_demande_id_proc_fkey";

-- DropTable
DROP TABLE "_SeanceProcedures";

-- DropTable
DROP TABLE "procedure";

-- CreateTable
CREATE TABLE "Procedure" (
    "id_proc" SERIAL NOT NULL,
    "id_typeproc" INTEGER NOT NULL,
    "num_proc" TEXT NOT NULL,
    "date_debut_proc" TIMESTAMP(3) NOT NULL,
    "date_fin_proc" TIMESTAMP(3),
    "statut_proc" "StatutProcedure" NOT NULL,
    "resultat" TEXT,
    "observations" TEXT,
    "id_seance" INTEGER,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id_proc")
);

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_num_proc_key" ON "Procedure"("num_proc");

-- AddForeignKey
ALTER TABLE "procedure_etape" ADD CONSTRAINT "procedure_etape_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "Procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_id_typeproc_fkey" FOREIGN KEY ("id_typeproc") REFERENCES "typeprocedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_id_seance_fkey" FOREIGN KEY ("id_seance") REFERENCES "SeanceCDPrevue"("id_seance") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "Procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureRenouvellement" ADD CONSTRAINT "ProcedureRenouvellement_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "Procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionWali" ADD CONSTRAINT "InteractionWali_id_procedure_fkey" FOREIGN KEY ("id_procedure") REFERENCES "Procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substance_associee_demande" ADD CONSTRAINT "substance_associee_demande_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "Procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureCoord" ADD CONSTRAINT "ProcedureCoord_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "Procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisProcedure" ADD CONSTRAINT "_PermisProcedure_B_fkey" FOREIGN KEY ("B") REFERENCES "Procedure"("id_proc") ON DELETE CASCADE ON UPDATE CASCADE;
