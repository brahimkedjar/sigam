-- CreateTable
CREATE TABLE "ProcedureRenouvellement" (
    "id_renouvellement" SERIAL NOT NULL,
    "id_proc" INTEGER NOT NULL,
    "nombre_renouvellement" INTEGER NOT NULL,
    "num_decision" TEXT NOT NULL,
    "date_decision" TIMESTAMP(3) NOT NULL,
    "date_debut_validite" TIMESTAMP(3) NOT NULL,
    "date_fin_validite" TIMESTAMP(3) NOT NULL,
    "commentaire" TEXT,

    CONSTRAINT "ProcedureRenouvellement_pkey" PRIMARY KEY ("id_renouvellement")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcedureRenouvellement_id_proc_key" ON "ProcedureRenouvellement"("id_proc");

-- AddForeignKey
ALTER TABLE "ProcedureRenouvellement" ADD CONSTRAINT "ProcedureRenouvellement_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;
