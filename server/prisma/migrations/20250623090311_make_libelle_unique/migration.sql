-- CreateTable
CREATE TABLE "demande_document_statut" (
    "id" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "id_doc" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demande_document_statut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "demande_document_statut_id_demande_id_doc_key" ON "demande_document_statut"("id_demande", "id_doc");

-- AddForeignKey
ALTER TABLE "demande_document_statut" ADD CONSTRAINT "demande_document_statut_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demande_document_statut" ADD CONSTRAINT "demande_document_statut_id_doc_fkey" FOREIGN KEY ("id_doc") REFERENCES "Document"("id_doc") ON DELETE RESTRICT ON UPDATE CASCADE;
