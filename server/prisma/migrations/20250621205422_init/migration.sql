-- CreateTable
CREATE TABLE "substances" (
    "id_sub" SERIAL NOT NULL,
    "nom_subFR" TEXT NOT NULL,
    "nom_subAR" TEXT NOT NULL,
    "categorie_sub" TEXT NOT NULL,
    "id_redevance" INTEGER,

    CONSTRAINT "substances_pkey" PRIMARY KEY ("id_sub")
);

-- CreateTable
CREATE TABLE "substance_associee_demande" (
    "id_assoc" SERIAL NOT NULL,
    "id_proc" INTEGER NOT NULL,
    "id_substance" INTEGER NOT NULL,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "substance_associee_demande_pkey" PRIMARY KEY ("id_assoc")
);

-- CreateTable
CREATE TABLE "redevance_bareme" (
    "id_redevance" SERIAL NOT NULL,
    "taux_redevance" DOUBLE PRECISION NOT NULL,
    "valeur_marchande" DOUBLE PRECISION NOT NULL,
    "unite" TEXT NOT NULL,
    "devise" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "redevance_bareme_pkey" PRIMARY KEY ("id_redevance")
);

-- CreateIndex
CREATE UNIQUE INDEX "substance_associee_demande_id_proc_id_substance_key" ON "substance_associee_demande"("id_proc", "id_substance");

-- AddForeignKey
ALTER TABLE "substances" ADD CONSTRAINT "substances_id_redevance_fkey" FOREIGN KEY ("id_redevance") REFERENCES "redevance_bareme"("id_redevance") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substance_associee_demande" ADD CONSTRAINT "substance_associee_demande_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substance_associee_demande" ADD CONSTRAINT "substance_associee_demande_id_substance_fkey" FOREIGN KEY ("id_substance") REFERENCES "substances"("id_sub") ON DELETE RESTRICT ON UPDATE CASCADE;
