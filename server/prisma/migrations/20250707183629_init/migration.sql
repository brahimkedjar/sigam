-- CreateTable
CREATE TABLE "cahiercharge" (
    "id" SERIAL NOT NULL,
    "permisId" INTEGER,
    "dateCreation" TIMESTAMP(3) NOT NULL,
    "dateExercice" TIMESTAMP(3) NOT NULL,
    "fuseau" TEXT,
    "typeCoordonnees" TEXT,
    "version" TEXT,
    "natureJuridique" TEXT,
    "vocationTerrain" TEXT,
    "nomGerant" TEXT,
    "personneChargeTrxx" TEXT,
    "qualification" TEXT,
    "reservesGeologiques" DOUBLE PRECISION,
    "reservesExploitables" DOUBLE PRECISION,
    "volumeExtraction" DOUBLE PRECISION,
    "dureeExploitation" INTEGER,
    "methodeExploitation" TEXT,
    "dureeTravaux" INTEGER,
    "dateDebutTravaux" TIMESTAMP(3),
    "dateDebutProduction" TIMESTAMP(3),
    "investissementDA" DOUBLE PRECISION,
    "investissementUSD" DOUBLE PRECISION,
    "capaciteInstallee" DOUBLE PRECISION,
    "commentaires" TEXT,
    "demandeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cahiercharge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cahiercharge" ADD CONSTRAINT "cahiercharge_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cahiercharge" ADD CONSTRAINT "cahiercharge_permisId_fkey" FOREIGN KEY ("permisId") REFERENCES "permis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
