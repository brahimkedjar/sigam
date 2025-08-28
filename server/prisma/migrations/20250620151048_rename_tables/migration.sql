/*
  Warnings:

  - You are about to drop the `Demande` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DetenteurMorale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FonctionPersonneMoral` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PersonnePhysique` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Procedure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeProcedure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Demande" DROP CONSTRAINT "Demande_id_proc_fkey";

-- DropForeignKey
ALTER TABLE "FonctionPersonneMoral" DROP CONSTRAINT "FonctionPersonneMoral_id_detenteur_fkey";

-- DropForeignKey
ALTER TABLE "FonctionPersonneMoral" DROP CONSTRAINT "FonctionPersonneMoral_id_personne_fkey";

-- DropForeignKey
ALTER TABLE "Procedure" DROP CONSTRAINT "Procedure_id_typeproc_fkey";

-- DropForeignKey
ALTER TABLE "_ProcedureDetenteurs" DROP CONSTRAINT "_ProcedureDetenteurs_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProcedureDetenteurs" DROP CONSTRAINT "_ProcedureDetenteurs_B_fkey";

-- DropTable
DROP TABLE "Demande";

-- DropTable
DROP TABLE "DetenteurMorale";

-- DropTable
DROP TABLE "FonctionPersonneMoral";

-- DropTable
DROP TABLE "PersonnePhysique";

-- DropTable
DROP TABLE "Procedure";

-- DropTable
DROP TABLE "TypeProcedure";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typeprocedure" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "domaine" TEXT NOT NULL,

    CONSTRAINT "typeprocedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure" (
    "id_proc" SERIAL NOT NULL,
    "id_typeproc" INTEGER NOT NULL,
    "num_proc" TEXT NOT NULL,
    "date_debut_proc" TIMESTAMP(3) NOT NULL,
    "date_fin_proc" TIMESTAMP(3),
    "statut_proc" TEXT NOT NULL,
    "resultat" TEXT,
    "observations" TEXT,

    CONSTRAINT "procedure_pkey" PRIMARY KEY ("id_proc")
);

-- CreateTable
CREATE TABLE "demande" (
    "id_demande" SERIAL NOT NULL,
    "id_proc" INTEGER NOT NULL,
    "id_expert" INTEGER,
    "code_demande" TEXT NOT NULL,
    "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

    CONSTRAINT "demande_pkey" PRIMARY KEY ("id_demande")
);

-- CreateTable
CREATE TABLE "detenteurmorale" (
    "id_detenteur" SERIAL NOT NULL,
    "id_statutJuridique" TEXT NOT NULL,
    "nom_societeFR" TEXT NOT NULL,
    "nom_sociétéAR" TEXT NOT NULL,
    "nationalité" TEXT NOT NULL,
    "adresse_siège" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "fax" TEXT NOT NULL,
    "pay" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "detenteurmorale_pkey" PRIMARY KEY ("id_detenteur")
);

-- CreateTable
CREATE TABLE "personnephysique" (
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

    CONSTRAINT "personnephysique_pkey" PRIMARY KEY ("id_personne")
);

-- CreateTable
CREATE TABLE "fonctionpersonnemoral" (
    "id_detenteur" INTEGER NOT NULL,
    "id_personne" INTEGER NOT NULL,
    "type_fonction" TEXT NOT NULL,
    "statut_personne" TEXT NOT NULL,
    "taux_participation" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fonctionpersonnemoral_pkey" PRIMARY KEY ("id_detenteur","id_personne")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_num_proc_key" ON "procedure"("num_proc");

-- CreateIndex
CREATE UNIQUE INDEX "demande_code_demande_key" ON "demande"("code_demande");

-- AddForeignKey
ALTER TABLE "procedure" ADD CONSTRAINT "procedure_id_typeproc_fkey" FOREIGN KEY ("id_typeproc") REFERENCES "typeprocedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fonctionpersonnemoral" ADD CONSTRAINT "fonctionpersonnemoral_id_detenteur_fkey" FOREIGN KEY ("id_detenteur") REFERENCES "detenteurmorale"("id_detenteur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fonctionpersonnemoral" ADD CONSTRAINT "fonctionpersonnemoral_id_personne_fkey" FOREIGN KEY ("id_personne") REFERENCES "personnephysique"("id_personne") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcedureDetenteurs" ADD CONSTRAINT "_ProcedureDetenteurs_A_fkey" FOREIGN KEY ("A") REFERENCES "detenteurmorale"("id_detenteur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProcedureDetenteurs" ADD CONSTRAINT "_ProcedureDetenteurs_B_fkey" FOREIGN KEY ("B") REFERENCES "procedure"("id_proc") ON DELETE CASCADE ON UPDATE CASCADE;
