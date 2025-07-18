-- CreateTable
CREATE TABLE "DossierAdministratif" (
    "id_dossier" SERIAL NOT NULL,
    "id_procedure" INTEGER NOT NULL,
    "nombre_doc" INTEGER NOT NULL,
    "remarques" TEXT,

    CONSTRAINT "DossierAdministratif_pkey" PRIMARY KEY ("id_dossier")
);

-- CreateTable
CREATE TABLE "Document" (
    "id_doc" SERIAL NOT NULL,
    "id_typedoc" INTEGER NOT NULL,
    "nom_doc" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "taille_doc" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id_doc")
);

-- CreateTable
CREATE TABLE "DossierDocument" (
    "id_dossier" INTEGER NOT NULL,
    "id_doc" INTEGER NOT NULL,

    CONSTRAINT "DossierDocument_pkey" PRIMARY KEY ("id_dossier","id_doc")
);

-- CreateTable
CREATE TABLE "TypeDoc" (
    "id_typedoc" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,

    CONSTRAINT "TypeDoc_pkey" PRIMARY KEY ("id_typedoc")
);

-- AddForeignKey
ALTER TABLE "DossierAdministratif" ADD CONSTRAINT "DossierAdministratif_id_procedure_fkey" FOREIGN KEY ("id_procedure") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_id_typedoc_fkey" FOREIGN KEY ("id_typedoc") REFERENCES "TypeDoc"("id_typedoc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierDocument" ADD CONSTRAINT "DossierDocument_id_doc_fkey" FOREIGN KEY ("id_doc") REFERENCES "Document"("id_doc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierDocument" ADD CONSTRAINT "DossierDocument_id_dossier_fkey" FOREIGN KEY ("id_dossier") REFERENCES "DossierAdministratif"("id_dossier") ON DELETE RESTRICT ON UPDATE CASCADE;
