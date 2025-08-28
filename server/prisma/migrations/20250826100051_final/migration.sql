/*
  Warnings:

  - You are about to drop the column `numero_decision` on the `ComiteDirection` table. All the data in the column will be lost.
  - You are about to drop the column `objet_deliberation` on the `ComiteDirection` table. All the data in the column will be lost.
  - You are about to drop the column `nom_commune` on the `Commune` table. All the data in the column will be lost.
  - You are about to drop the column `nom_daira` on the `Daira` table. All the data in the column will be lost.
  - You are about to drop the column `nom_wilaya` on the `Wilaya` table. All the data in the column will be lost.
  - You are about to drop the column `dateCreation` on the `cahiercharge` table. All the data in the column will be lost.
  - You are about to drop the column `budget_prevu` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `capital_social_disponible` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `date_enregistrement` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `date_fin` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `date_instruction` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `description_travaux` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `id_typeproc` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `instruction_demande` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `lieu_dit` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `motif_rejet` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `objet_demande` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `sources_financement` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `nom_sociétéAR` on the `detenteurmorale` table. All the data in the column will be lost.
  - You are about to drop the column `nom_societeFR` on the `detenteurmorale` table. All the data in the column will be lost.
  - You are about to drop the column `pay` on the `detenteurmorale` table. All the data in the column will be lost.
  - You are about to drop the column `fonction` on the `expertminier` table. All the data in the column will be lost.
  - You are about to drop the column `num_registre` on the `expertminier` table. All the data in the column will be lost.
  - You are about to drop the column `organisme` on the `expertminier` table. All the data in the column will be lost.
  - You are about to drop the column `lieu_dit` on the `permis` table. All the data in the column will be lost.
  - You are about to drop the column `pay` on the `personnephysique` table. All the data in the column will be lost.
  - You are about to drop the column `réf_professionnelles` on the `personnephysique` table. All the data in the column will be lost.
  - You are about to drop the column `categorie_sub` on the `substances` table. All the data in the column will be lost.
  - You are about to drop the `Ingenieur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ZoneInterdite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permis_templates` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[lib_type]` on the table `typepermis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code_type]` on the table `typepermis` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nom_communeAR` to the `Commune` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_communeFR` to the `Commune` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_dairaAR` to the `Daira` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_dairaFR` to the `Daira` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_decision` to the `DecisionCD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_wilaya` to the `InteractionWali` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_wilayaAR` to the `Wilaya` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_wilayaFR` to the `Wilaya` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zone` to the `Wilaya` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_etablissement` to the `cahiercharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lieu_signature` to the `cahiercharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_cdc` to the `cahiercharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signataire_administration` to the `cahiercharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_demarrage` to the `demande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_pays` to the `demande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_typeProc` to the `demande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_pays` to the `detenteurmorale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_societeAR` to the `detenteurmorale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom_societeFR` to the `detenteurmorale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `site_web` to the `detenteurmorale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_agrement` to the `expertminier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `etat_agrement` to the `expertminier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_agrement` to the `expertminier` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `statut` on the `obligationfiscale` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `id_pays` to the `personnephysique` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ref_professionnelles` to the `personnephysique` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priorite` to the `substance_associee_demande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categorie_sub` to the `substances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `famille_sub` to the `substances` table without a default value. This is not possible if the table is not empty.
  - Made the column `id_redevance` on table `substances` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Enumpriorite" AS ENUM ('principale', 'secondaire');

-- CreateEnum
CREATE TYPE "EnumStatutPaiement" AS ENUM ('A_payer', 'Payé', 'En_retard', 'Annulé');

-- AlterEnum
ALTER TYPE "EnumDecisionComite" ADD VALUE 'autre';

-- DropForeignKey
ALTER TABLE "Coordonnee" DROP CONSTRAINT "Coordonnee_id_zone_interdite_fkey";

-- DropForeignKey
ALTER TABLE "demande" DROP CONSTRAINT "demande_id_typeproc_fkey";

-- DropForeignKey
ALTER TABLE "permis_templates" DROP CONSTRAINT "permis_templates_permisId_fkey";

-- DropForeignKey
ALTER TABLE "permis_templates" DROP CONSTRAINT "permis_templates_typePermisId_fkey";

-- DropForeignKey
ALTER TABLE "substances" DROP CONSTRAINT "substances_id_redevance_fkey";

-- AlterTable
ALTER TABLE "ComiteDirection" DROP COLUMN "numero_decision",
DROP COLUMN "objet_deliberation";

-- AlterTable
ALTER TABLE "Commune" DROP COLUMN "nom_commune",
ADD COLUMN     "nom_communeAR" TEXT NOT NULL,
ADD COLUMN     "nom_communeFR" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Daira" DROP COLUMN "nom_daira",
ADD COLUMN     "nom_dairaAR" TEXT NOT NULL,
ADD COLUMN     "nom_dairaFR" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DecisionCD" ADD COLUMN     "numero_decision" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InteractionWali" ADD COLUMN     "id_wilaya" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Procedure" ADD COLUMN     "typeProcedureId" INTEGER;

-- AlterTable
ALTER TABLE "Wilaya" DROP COLUMN "nom_wilaya",
ADD COLUMN     "nom_wilayaAR" TEXT NOT NULL,
ADD COLUMN     "nom_wilayaFR" TEXT NOT NULL,
ADD COLUMN     "zone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "cahiercharge" DROP COLUMN "dateCreation",
ADD COLUMN     "date_etablissement" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lieu_signature" TEXT NOT NULL,
ADD COLUMN     "num_cdc" TEXT NOT NULL,
ADD COLUMN     "signataire_administration" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "demande" DROP COLUMN "budget_prevu",
DROP COLUMN "capital_social_disponible",
DROP COLUMN "date_enregistrement",
DROP COLUMN "date_fin",
DROP COLUMN "date_instruction",
DROP COLUMN "description_travaux",
DROP COLUMN "id_typeproc",
DROP COLUMN "instruction_demande",
DROP COLUMN "lieu_dit",
DROP COLUMN "motif_rejet",
DROP COLUMN "objet_demande",
DROP COLUMN "sources_financement",
ADD COLUMN     "con_res_exp" TEXT,
ADD COLUMN     "con_res_geo" TEXT,
ADD COLUMN     "date_demarrage" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "date_fin_instruction" TIMESTAMP(3),
ADD COLUMN     "id_pays" INTEGER NOT NULL,
ADD COLUMN     "id_typeProc" INTEGER NOT NULL,
ADD COLUMN     "intitule_projet" TEXT,
ADD COLUMN     "lieu_ditFR" TEXT,
ADD COLUMN     "locPointOrigine" TEXT,
ADD COLUMN     "montant_produit" TEXT,
ADD COLUMN     "nom_pre_signataire" TEXT,
ADD COLUMN     "qualite_signataire" TEXT,
ADD COLUMN     "volume_prevu" TEXT;

-- AlterTable
ALTER TABLE "detenteurmorale" DROP COLUMN "nom_sociétéAR",
DROP COLUMN "nom_societeFR",
DROP COLUMN "pay",
ADD COLUMN     "id_pays" INTEGER NOT NULL,
ADD COLUMN     "nom_societeAR" TEXT NOT NULL,
ADD COLUMN     "nom_societeFR" TEXT NOT NULL,
ADD COLUMN     "site_web" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "expertminier" DROP COLUMN "fonction",
DROP COLUMN "num_registre",
DROP COLUMN "organisme",
ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "date_agrement" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "etat_agrement" TEXT NOT NULL,
ADD COLUMN     "fax_expert" TEXT,
ADD COLUMN     "num_agrement" TEXT NOT NULL,
ADD COLUMN     "specialisation" TEXT,
ADD COLUMN     "tel_expert" TEXT;

-- AlterTable
ALTER TABLE "obligationfiscale" DROP COLUMN "statut",
ADD COLUMN     "statut" "EnumStatutPaiement" NOT NULL;

-- AlterTable
ALTER TABLE "paiement" ADD COLUMN     "date_remisOp" TIMESTAMP(3),
ADD COLUMN     "num_perc" TEXT;

-- AlterTable
ALTER TABLE "permis" DROP COLUMN "lieu_dit",
ADD COLUMN     "date_conversion_permis" TIMESTAMP(3),
ADD COLUMN     "hypothec" TEXT,
ADD COLUMN     "invest_prevu" TEXT,
ADD COLUMN     "invest_real" TEXT,
ADD COLUMN     "lieu_ditAR" TEXT,
ADD COLUMN     "lieu_ditFR" TEXT,
ADD COLUMN     "montant_offre" TEXT,
ADD COLUMN     "nom_projet" TEXT,
ADD COLUMN     "volume_prevu" TEXT;

-- AlterTable
ALTER TABLE "personnephysique" DROP COLUMN "pay",
DROP COLUMN "réf_professionnelles",
ADD COLUMN     "id_pays" INTEGER NOT NULL,
ADD COLUMN     "ref_professionnelles" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "substance_associee_demande" ADD COLUMN     "priorite" "Enumpriorite" NOT NULL;

-- AlterTable
ALTER TABLE "substances" DROP COLUMN "categorie_sub",
ADD COLUMN     "categorie_sub" TEXT NOT NULL,
ADD COLUMN     "famille_sub" TEXT NOT NULL,
ALTER COLUMN "id_redevance" SET NOT NULL;

-- DropTable
DROP TABLE "Ingenieur";

-- DropTable
DROP TABLE "ZoneInterdite";

-- DropTable
DROP TABLE "permis_templates";

-- CreateTable
CREATE TABLE "codeAssimilation" (
    "id_code" SERIAL NOT NULL,
    "id_ancienType" INTEGER NOT NULL,
    "id_permis" INTEGER NOT NULL,
    "ancien_code" TEXT NOT NULL,

    CONSTRAINT "codeAssimilation_pkey" PRIMARY KEY ("id_code")
);

-- CreateTable
CREATE TABLE "AncienTypePermis" (
    "id_ancienType" SERIAL NOT NULL,
    "lib_type" TEXT NOT NULL,
    "code_type" TEXT NOT NULL,

    CONSTRAINT "AncienTypePermis_pkey" PRIMARY KEY ("id_ancienType")
);

-- CreateTable
CREATE TABLE "demFermeture" (
    "id_fermeture" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "num_decision" TEXT,
    "date_constat" TIMESTAMP(3),
    "rapport" TEXT,

    CONSTRAINT "demFermeture_pkey" PRIMARY KEY ("id_fermeture")
);

-- CreateTable
CREATE TABLE "demAnnulation" (
    "id_annulation" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "num_decision" TEXT,
    "date_constat" TIMESTAMP(3),
    "date_annulation" TIMESTAMP(3),
    "cause_annulation" TEXT,
    "statut_annulation" TEXT,

    CONSTRAINT "demAnnulation_pkey" PRIMARY KEY ("id_annulation")
);

-- CreateTable
CREATE TABLE "demSubstitution" (
    "id_substitution" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "num_decision" TEXT,
    "date_decision" TIMESTAMP(3),
    "motif_substitution" TEXT,
    "commentaires" TEXT,

    CONSTRAINT "demSubstitution_pkey" PRIMARY KEY ("id_substitution")
);

-- CreateTable
CREATE TABLE "demModification" (
    "id_modification" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "type_modif" TEXT,
    "statut_modification" TEXT,

    CONSTRAINT "demModification_pkey" PRIMARY KEY ("id_modification")
);

-- CreateTable
CREATE TABLE "demCession" (
    "id_cession" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "id_ancienCessionnaire" INTEGER NOT NULL,
    "id_nouveauCessionnaire" INTEGER NOT NULL,
    "motif_cession" TEXT,
    "nature_cession" TEXT,
    "taux_cession" DOUBLE PRECISION,
    "date_validation" TIMESTAMP(3),

    CONSTRAINT "demCession_pkey" PRIMARY KEY ("id_cession")
);

-- CreateTable
CREATE TABLE "demRenonciation" (
    "id_renonciation" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "motif_renonciation" TEXT,
    "rapport_technique" TEXT,

    CONSTRAINT "demRenonciation_pkey" PRIMARY KEY ("id_renonciation")
);

-- CreateTable
CREATE TABLE "demFusion" (
    "id_fusion" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "id_permisResultant" INTEGER NOT NULL,
    "date_fusion" TIMESTAMP(3) NOT NULL,
    "motif_fusion" TEXT,
    "statut_fusion" TEXT,

    CONSTRAINT "demFusion_pkey" PRIMARY KEY ("id_fusion")
);

-- CreateTable
CREATE TABLE "fusionPermisSource" (
    "id_permis" INTEGER NOT NULL,
    "id_fusion" INTEGER NOT NULL,

    CONSTRAINT "fusionPermisSource_pkey" PRIMARY KEY ("id_permis","id_fusion")
);

-- CreateTable
CREATE TABLE "demTransfert" (
    "id_transfert" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "motif_transfert" TEXT,
    "observations" TEXT,

    CONSTRAINT "demTransfert_pkey" PRIMARY KEY ("id_transfert")
);

-- CreateTable
CREATE TABLE "TransfertDetenteur" (
    "id_detenteur" INTEGER NOT NULL,
    "id_transfert" INTEGER NOT NULL,
    "type_detenteur" TEXT NOT NULL,

    CONSTRAINT "TransfertDetenteur_pkey" PRIMARY KEY ("id_detenteur","id_transfert")
);

-- CreateTable
CREATE TABLE "demandeVerificationGeo" (
    "id_demVerif" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "sit_geo_ok" BOOLEAN,
    "empiet_ok" BOOLEAN,
    "superf_ok" BOOLEAN,
    "geom_ok" BOOLEAN,
    "date_fin_ramassage" TIMESTAMP(3),
    "site_determine_angcm" BOOLEAN,
    "verification_cadastrale_ok" BOOLEAN,
    "statut_modification" TEXT,

    CONSTRAINT "demandeVerificationGeo_pkey" PRIMARY KEY ("id_demVerif")
);

-- CreateTable
CREATE TABLE "demandeObs" (
    "id_demandeObs" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "obs_situation_geo" TEXT,
    "obs_empietement" TEXT,
    "obs_emplacement" TEXT,
    "obs_geom" TEXT,
    "obs_superficie" TEXT,

    CONSTRAINT "demandeObs_pkey" PRIMARY KEY ("id_demandeObs")
);

-- CreateTable
CREATE TABLE "demandeMin" (
    "id_demMin" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "min_label" TEXT,
    "min_teneur" DOUBLE PRECISION,
    "ordre_mineral" TEXT,

    CONSTRAINT "demandeMin_pkey" PRIMARY KEY ("id_demMin")
);

-- CreateTable
CREATE TABLE "pays" (
    "id_pays" SERIAL NOT NULL,
    "nom_pays" TEXT NOT NULL,
    "nationalite" TEXT NOT NULL,

    CONSTRAINT "pays_pkey" PRIMARY KEY ("id_pays")
);

-- CreateTable
CREATE TABLE "MembreSeance" (
    "id_seance" INTEGER NOT NULL,
    "id_membre" INTEGER NOT NULL,

    CONSTRAINT "MembreSeance_pkey" PRIMARY KEY ("id_seance","id_membre")
);

-- CreateTable
CREATE TABLE "TsPaiement" (
    "id_tsPaiement" SERIAL NOT NULL,
    "id_paiement" INTEGER,
    "datePerDebut" TIMESTAMP(3) NOT NULL,
    "datePerFin" TIMESTAMP(3) NOT NULL,
    "surfaceMin" DOUBLE PRECISION NOT NULL,
    "surfaceMax" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TsPaiement_pkey" PRIMARY KEY ("id_tsPaiement")
);

-- CreateIndex
CREATE UNIQUE INDEX "demFermeture_id_demande_key" ON "demFermeture"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demAnnulation_id_demande_key" ON "demAnnulation"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demSubstitution_id_demande_key" ON "demSubstitution"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demModification_id_demande_key" ON "demModification"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demCession_id_demande_key" ON "demCession"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demRenonciation_id_demande_key" ON "demRenonciation"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demFusion_id_demande_key" ON "demFusion"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demFusion_id_permisResultant_key" ON "demFusion"("id_permisResultant");

-- CreateIndex
CREATE UNIQUE INDEX "demTransfert_id_demande_key" ON "demTransfert"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demandeVerificationGeo_id_demande_key" ON "demandeVerificationGeo"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demandeObs_id_demande_key" ON "demandeObs"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "demandeMin_id_demande_key" ON "demandeMin"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "typepermis_lib_type_key" ON "typepermis"("lib_type");

-- CreateIndex
CREATE UNIQUE INDEX "typepermis_code_type_key" ON "typepermis"("code_type");

-- AddForeignKey
ALTER TABLE "codeAssimilation" ADD CONSTRAINT "codeAssimilation_id_ancienType_fkey" FOREIGN KEY ("id_ancienType") REFERENCES "AncienTypePermis"("id_ancienType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codeAssimilation" ADD CONSTRAINT "codeAssimilation_id_permis_fkey" FOREIGN KEY ("id_permis") REFERENCES "permis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_typeProcedureId_fkey" FOREIGN KEY ("typeProcedureId") REFERENCES "typeprocedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_typeProc_fkey" FOREIGN KEY ("id_typeProc") REFERENCES "typeprocedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande" ADD CONSTRAINT "demande_id_pays_fkey" FOREIGN KEY ("id_pays") REFERENCES "pays"("id_pays") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demFermeture" ADD CONSTRAINT "demFermeture_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demAnnulation" ADD CONSTRAINT "demAnnulation_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demSubstitution" ADD CONSTRAINT "demSubstitution_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demModification" ADD CONSTRAINT "demModification_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demCession" ADD CONSTRAINT "demCession_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demCession" ADD CONSTRAINT "demCession_id_ancienCessionnaire_fkey" FOREIGN KEY ("id_ancienCessionnaire") REFERENCES "personnephysique"("id_personne") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demCession" ADD CONSTRAINT "demCession_id_nouveauCessionnaire_fkey" FOREIGN KEY ("id_nouveauCessionnaire") REFERENCES "personnephysique"("id_personne") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demRenonciation" ADD CONSTRAINT "demRenonciation_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demFusion" ADD CONSTRAINT "demFusion_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demFusion" ADD CONSTRAINT "demFusion_id_permisResultant_fkey" FOREIGN KEY ("id_permisResultant") REFERENCES "permis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fusionPermisSource" ADD CONSTRAINT "fusionPermisSource_id_permis_fkey" FOREIGN KEY ("id_permis") REFERENCES "permis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fusionPermisSource" ADD CONSTRAINT "fusionPermisSource_id_fusion_fkey" FOREIGN KEY ("id_fusion") REFERENCES "demFusion"("id_fusion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demTransfert" ADD CONSTRAINT "demTransfert_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransfertDetenteur" ADD CONSTRAINT "TransfertDetenteur_id_transfert_fkey" FOREIGN KEY ("id_transfert") REFERENCES "demTransfert"("id_transfert") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransfertDetenteur" ADD CONSTRAINT "TransfertDetenteur_id_detenteur_fkey" FOREIGN KEY ("id_detenteur") REFERENCES "detenteurmorale"("id_detenteur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandeVerificationGeo" ADD CONSTRAINT "demandeVerificationGeo_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandeObs" ADD CONSTRAINT "demandeObs_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandeMin" ADD CONSTRAINT "demandeMin_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detenteurmorale" ADD CONSTRAINT "detenteurmorale_id_pays_fkey" FOREIGN KEY ("id_pays") REFERENCES "pays"("id_pays") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnephysique" ADD CONSTRAINT "personnephysique_id_pays_fkey" FOREIGN KEY ("id_pays") REFERENCES "pays"("id_pays") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteractionWali" ADD CONSTRAINT "InteractionWali_id_wilaya_fkey" FOREIGN KEY ("id_wilaya") REFERENCES "Wilaya"("id_wilaya") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substances" ADD CONSTRAINT "substances_id_redevance_fkey" FOREIGN KEY ("id_redevance") REFERENCES "redevance_bareme"("id_redevance") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreSeance" ADD CONSTRAINT "MembreSeance_id_seance_fkey" FOREIGN KEY ("id_seance") REFERENCES "SeanceCDPrevue"("id_seance") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembreSeance" ADD CONSTRAINT "MembreSeance_id_membre_fkey" FOREIGN KEY ("id_membre") REFERENCES "MembresComite"("id_membre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TsPaiement" ADD CONSTRAINT "TsPaiement_id_paiement_fkey" FOREIGN KEY ("id_paiement") REFERENCES "paiement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
