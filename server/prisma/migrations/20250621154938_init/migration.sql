-- AlterTable
ALTER TABLE "demande" ADD COLUMN     "budget_prevu" DOUBLE PRECISION,
ADD COLUMN     "capital_social_disponible" DOUBLE PRECISION,
ADD COLUMN     "description_travaux" TEXT,
ADD COLUMN     "sources_financement" TEXT;

-- CreateTable
CREATE TABLE "expertminier" (
    "id_expert" SERIAL NOT NULL,
    "nom_expert" TEXT NOT NULL,
    "fonction" TEXT NOT NULL,
    "num_registre" TEXT,
    "organisme" TEXT NOT NULL,
    "id_demande" INTEGER,

    CONSTRAINT "expertminier_pkey" PRIMARY KEY ("id_expert")
);

-- CreateIndex
CREATE UNIQUE INDEX "expertminier_id_demande_key" ON "expertminier"("id_demande");

-- AddForeignKey
ALTER TABLE "expertminier" ADD CONSTRAINT "expertminier_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE SET NULL ON UPDATE CASCADE;
