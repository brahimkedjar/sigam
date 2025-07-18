-- CreateTable
CREATE TABLE "TypeProcedure" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "domaine" TEXT NOT NULL,

    CONSTRAINT "TypeProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id_proc" SERIAL NOT NULL,
    "id_typeproc" INTEGER NOT NULL,
    "num_proc" TEXT NOT NULL,
    "date_debut_proc" TIMESTAMP(3) NOT NULL,
    "date_fin_proc" TIMESTAMP(3),
    "statut_proc" TEXT NOT NULL,
    "resultat" TEXT,
    "observations" TEXT,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id_proc")
);

-- CreateTable
CREATE TABLE "DetenteurMorale" (
    "id_detenteur" SERIAL NOT NULL,
    "id_statutJuridique" TEXT NOT NULL,
    "nom_sociétéFR" TEXT NOT NULL,
    "nom_sociétéAR" TEXT NOT NULL,
    "nationalité" TEXT NOT NULL,
    "adresse_siège" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "fax" TEXT NOT NULL,
    "pay" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "DetenteurMorale_pkey" PRIMARY KEY ("id_detenteur")
);

-- CreateTable
CREATE TABLE "PersonnePhysique" (
    "id_personne" SERIAL NOT NULL,
    "nomFR" TEXT NOT NULL,
    "nomAR" TEXT NOT NULL,
    "prenomFR" TEXT NOT NULL,
    "prenomAR" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "lieu_naissance" TEXT NOT NULL,
    "pay" TEXT NOT NULL,
    "nationalité" TEXT NOT NULL,
    "adresse_domicile" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "fax" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "num_carte_identité" TEXT NOT NULL,
    "lieu_juridique_soc" TEXT NOT NULL,
    "réf_professionnelles" TEXT NOT NULL,

    CONSTRAINT "PersonnePhysique_pkey" PRIMARY KEY ("id_personne")
);

-- CreateTable
CREATE TABLE "FonctionPersonneMoral" (
    "id_detenteur" INTEGER NOT NULL,
    "id_personne" INTEGER NOT NULL,
    "type_fonction" TEXT NOT NULL,
    "statut_personne" TEXT NOT NULL,
    "taux_participation" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FonctionPersonneMoral_pkey" PRIMARY KEY ("id_detenteur","id_personne")
);

-- CreateTable
CREATE TABLE "Demande" (
    "id_demande" SERIAL NOT NULL,
    "id_proc" INTEGER NOT NULL,
    "id_expert" INTEGER,
    "code_demande" TEXT NOT NULL,
    "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type_permis_demande" TEXT NOT NULL,
    "objet_demande" TEXT,
    "date_enregistrement" TIMESTAMP(3),
    "date_instruction" TIMESTAMP(3),
    "date_refus" TIMESTAMP(3),
    "lieu_dit" TEXT,
    "superficie" DOUBLE PRECISION,
    "statut_juridique_terrain" TEXT,
    "occupant_terrain_legal" TEXT,
    "destination" TEXT,
    "duree_travaux_estimee" INTEGER,
    "date_demarrage_prevue" TIMESTAMP(3),
    "instruction_demande" TEXT,
    "motif_rejet" TEXT,
    "remarques" TEXT,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id_demande")
);

-- CreateTable
CREATE TABLE "_ProcedureDetenteurs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProcedureDetenteurs_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_num_proc_key" ON "Procedure"("num_proc");

-- CreateIndex
CREATE UNIQUE INDEX "Demande_code_demande_key" ON "Demande"("code_demande");

-- CreateIndex
CREATE INDEX "_ProcedureDetenteurs_B_index" ON "_ProcedureDetenteurs"("B");

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_id_typeproc_fkey" FOREIGN KEY ("id_typeproc") REFERENCES "TypeProcedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FonctionPersonneMoral" ADD CONSTRAINT "FonctionPersonneMoral_id_detenteur_fkey" FOREIGN KEY ("id_detenteur") REFERENCES "DetenteurMorale"("id_detenteur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FonctionPersonneMoral" ADD CONSTRAINT "FonctionPersonneMoral_id_personne_fkey" FOREIGN KEY ("id_personne") REFERENCES "PersonnePhysique"("id_personne") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "Procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcedureDetenteurs" ADD CONSTRAINT "_ProcedureDetenteurs_A_fkey" FOREIGN KEY ("A") REFERENCES "DetenteurMorale"("id_detenteur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcedureDetenteurs" ADD CONSTRAINT "_ProcedureDetenteurs_B_fkey" FOREIGN KEY ("B") REFERENCES "Procedure"("id_proc") ON DELETE CASCADE ON UPDATE CASCADE;
