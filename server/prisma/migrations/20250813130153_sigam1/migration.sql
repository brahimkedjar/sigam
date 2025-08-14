-- CreateEnum
CREATE TYPE "NatureCession" AS ENUM ('partielle', 'totale', 'majoritaire', 'minoritaire');

-- CreateEnum
CREATE TYPE "StatutCession" AS ENUM ('en_cours', 'acceptee', 'refusee', 'annulee');

-- CreateTable
CREATE TABLE "procedure_cession" (
    "id_cession" SERIAL NOT NULL,
    "id_proc" INTEGER NOT NULL,
    "id_ancien_cessionaire" INTEGER,
    "id_nouveau_cessionaire" INTEGER,
    "taux_cession" DOUBLE PRECISION NOT NULL,
    "motif" TEXT,
    "nature_cession" "NatureCession" NOT NULL,
    "observation" TEXT,
    "statut" "StatutCession" NOT NULL,

    CONSTRAINT "procedure_cession_pkey" PRIMARY KEY ("id_cession")
);

-- AddForeignKey
ALTER TABLE "procedure_cession" ADD CONSTRAINT "procedure_cession_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "Procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_cession" ADD CONSTRAINT "procedure_cession_id_ancien_cessionaire_fkey" FOREIGN KEY ("id_ancien_cessionaire") REFERENCES "personnephysique"("id_personne") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_cession" ADD CONSTRAINT "procedure_cession_id_nouveau_cessionaire_fkey" FOREIGN KEY ("id_nouveau_cessionaire") REFERENCES "personnephysique"("id_personne") ON DELETE SET NULL ON UPDATE CASCADE;
