/*
  Warnings:

  - You are about to drop the `demande_document_statut` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "demande_document_statut" DROP CONSTRAINT "demande_document_statut_id_demande_fkey";

-- DropForeignKey
ALTER TABLE "demande_document_statut" DROP CONSTRAINT "demande_document_statut_id_doc_fkey";

-- DropTable
DROP TABLE "demande_document_statut";

-- CreateTable
CREATE TABLE "dossier_fournis" (
    "id_dossierFournis" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "date_depot" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut_dossier" TEXT NOT NULL,
    "remarques" TEXT,

    CONSTRAINT "dossier_fournis_pkey" PRIMARY KEY ("id_dossierFournis")
);

-- CreateTable
CREATE TABLE "dossier_fournis_document" (
    "id_dossierFournis" INTEGER NOT NULL,
    "id_doc" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dossier_fournis_document_pkey" PRIMARY KEY ("id_dossierFournis","id_doc")
);

-- AddForeignKey
ALTER TABLE "dossier_fournis" ADD CONSTRAINT "dossier_fournis_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_fournis_document" ADD CONSTRAINT "dossier_fournis_document_id_dossierFournis_fkey" FOREIGN KEY ("id_dossierFournis") REFERENCES "dossier_fournis"("id_dossierFournis") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_fournis_document" ADD CONSTRAINT "dossier_fournis_document_id_doc_fkey" FOREIGN KEY ("id_doc") REFERENCES "Document"("id_doc") ON DELETE RESTRICT ON UPDATE CASCADE;
