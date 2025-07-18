-- CreateTable
CREATE TABLE "CD" (
    "id_comite" SERIAL NOT NULL,
    "id_procedure" INTEGER NOT NULL,
    "date_comite" TIMESTAMP(3),
    "numero_decision" TEXT,
    "objet_delib" TEXT,
    "decision_comite" TEXT,
    "resume_reunion" TEXT,
    "contenu_decision" TEXT,
    "note_synthese" TEXT,
    "fiche_technique" TEXT,
    "carte_proj" TEXT,
    "rapport_police" TEXT,
    "instructeur" TEXT,
    "dossier_pret" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CD_pkey" PRIMARY KEY ("id_comite")
);

-- CreateTable
CREATE TABLE "MembreComite" (
    "id_membre" SERIAL NOT NULL,
    "nom_membre" TEXT NOT NULL,
    "prenom_membre" TEXT NOT NULL,
    "fonction_membre" TEXT NOT NULL,
    "email_membre" TEXT NOT NULL,

    CONSTRAINT "MembreComite_pkey" PRIMARY KEY ("id_membre")
);

-- CreateTable
CREATE TABLE "MembresCD" (
    "id" SERIAL NOT NULL,
    "id_comite" INTEGER NOT NULL,
    "id_membre" INTEGER NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT false,
    "signature" TEXT,

    CONSTRAINT "MembresCD_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CD" ADD CONSTRAINT "CD_id_procedure_fkey" FOREIGN KEY ("id_procedure") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembresCD" ADD CONSTRAINT "MembresCD_id_comite_fkey" FOREIGN KEY ("id_comite") REFERENCES "CD"("id_comite") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembresCD" ADD CONSTRAINT "MembresCD_id_membre_fkey" FOREIGN KEY ("id_membre") REFERENCES "MembreComite"("id_membre") ON DELETE RESTRICT ON UPDATE CASCADE;
