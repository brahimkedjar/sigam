-- CreateTable
CREATE TABLE "rapport_activite" (
    "id_rapport" SERIAL NOT NULL,
    "id_permis" INTEGER NOT NULL,
    "date_remise_reelle" TIMESTAMP(3) NOT NULL,
    "etat_activite" TEXT NOT NULL,
    "leve_topo_3112" TEXT,
    "leve_topo_3006" TEXT,
    "plan_exploitation" TEXT,
    "date_debut_travaux" TIMESTAMP(3),
    "vente_exportation" TEXT,
    "importation" TEXT,
    "valeur_equipement_acquis" DOUBLE PRECISION,
    "pros_expl_entamee" TEXT,
    "avancee_travaux" TEXT,
    "travaux_realises" TEXT,
    "nbr_ouvrages" INTEGER,
    "volume" DOUBLE PRECISION,
    "resume_activites" TEXT,
    "investissements_realises" DOUBLE PRECISION,
    "qte_explosifs" DOUBLE PRECISION,
    "qte_explosifs_DIM" DOUBLE PRECISION,
    "detonateurs" INTEGER,
    "dmr" INTEGER,
    "cordeau_detonant" INTEGER,
    "meche_lente" INTEGER,
    "relais" INTEGER,
    "DEI" INTEGER,
    "effectif_cadre" INTEGER,
    "effectif_maitrise" INTEGER,
    "effectif_execution" INTEGER,
    "production_toutvenant" DOUBLE PRECISION,
    "production_marchande" DOUBLE PRECISION,
    "production_vendue" DOUBLE PRECISION,
    "production_stocke" DOUBLE PRECISION,
    "stock_T_V" DOUBLE PRECISION,
    "stock_produit_marchand" DOUBLE PRECISION,
    "production_sable" DOUBLE PRECISION,
    "poussieres" DOUBLE PRECISION,
    "rejets_laverie" DOUBLE PRECISION,
    "fumee_gaz" DOUBLE PRECISION,
    "autres_effluents" DOUBLE PRECISION,
    "nbr_accidents" INTEGER,
    "accidents_mortels" INTEGER,
    "accidents_non_mortels" INTEGER,
    "nbrs_jours_perdues" INTEGER,
    "taux_frequence" DOUBLE PRECISION,
    "taux_gravite" DOUBLE PRECISION,
    "nbrs_incidents" INTEGER,
    "nbrs_malades_pro" INTEGER,
    "remise_etat_realisee" TEXT,
    "cout_remise_etat" DOUBLE PRECISION,
    "commentaires_generaux" TEXT,
    "rapport_url" TEXT,

    CONSTRAINT "rapport_activite_pkey" PRIMARY KEY ("id_rapport")
);

-- CreateTable
CREATE TABLE "typepaiement" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "frequence" TEXT NOT NULL,
    "details_calcul" TEXT,

    CONSTRAINT "typepaiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligationfiscale" (
    "id" SERIAL NOT NULL,
    "id_typePaiement" INTEGER NOT NULL,
    "id_permis" INTEGER NOT NULL,
    "annee_fiscale" INTEGER NOT NULL,
    "montant_attendu" DOUBLE PRECISION NOT NULL,
    "date_echeance" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL,
    "details_calcul" TEXT,

    CONSTRAINT "obligationfiscale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiement" (
    "id" SERIAL NOT NULL,
    "id_obligation" INTEGER NOT NULL,
    "montant_paye" DOUBLE PRECISION NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'DZD',
    "date_paiement" TIMESTAMP(3) NOT NULL,
    "mode_paiement" TEXT NOT NULL,
    "num_quittance" TEXT,
    "etat_paiement" TEXT NOT NULL,
    "justificatif_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "typepaiement_libelle_key" ON "typepaiement"("libelle");

-- AddForeignKey
ALTER TABLE "rapport_activite" ADD CONSTRAINT "rapport_activite_id_permis_fkey" FOREIGN KEY ("id_permis") REFERENCES "permis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligationfiscale" ADD CONSTRAINT "obligationfiscale_id_typePaiement_fkey" FOREIGN KEY ("id_typePaiement") REFERENCES "typepaiement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligationfiscale" ADD CONSTRAINT "obligationfiscale_id_permis_fkey" FOREIGN KEY ("id_permis") REFERENCES "permis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiement" ADD CONSTRAINT "paiement_id_obligation_fkey" FOREIGN KEY ("id_obligation") REFERENCES "obligationfiscale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
