-- CreateTable
CREATE TABLE "statutjuridique" (
    "id_statutJuridique" TEXT NOT NULL,
    "code_statut" TEXT NOT NULL,
    "statut_fr" TEXT NOT NULL,
    "statut_ar" TEXT NOT NULL,

    CONSTRAINT "statutjuridique_pkey" PRIMARY KEY ("id_statutJuridique")
);

-- CreateIndex
CREATE UNIQUE INDEX "statutjuridique_code_statut_key" ON "statutjuridique"("code_statut");

-- AddForeignKey
ALTER TABLE "detenteurmorale" ADD CONSTRAINT "detenteurmorale_id_statutJuridique_fkey" FOREIGN KEY ("id_statutJuridique") REFERENCES "statutjuridique"("id_statutJuridique") ON DELETE RESTRICT ON UPDATE CASCADE;
