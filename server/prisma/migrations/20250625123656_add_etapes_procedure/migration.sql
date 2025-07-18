-- CreateTable
CREATE TABLE "etape_proc" (
    "id_etape" SERIAL NOT NULL,
    "lib_etape" TEXT NOT NULL,
    "duree_etape" INTEGER,
    "ordre_etape" INTEGER NOT NULL,

    CONSTRAINT "etape_proc_pkey" PRIMARY KEY ("id_etape")
);

-- CreateTable
CREATE TABLE "procedure_etape" (
    "id_proc" INTEGER NOT NULL,
    "id_etape" INTEGER NOT NULL,
    "statut" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),

    CONSTRAINT "procedure_etape_pkey" PRIMARY KEY ("id_proc","id_etape")
);

-- AddForeignKey
ALTER TABLE "procedure_etape" ADD CONSTRAINT "procedure_etape_id_proc_fkey" FOREIGN KEY ("id_proc") REFERENCES "procedure"("id_proc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_etape" ADD CONSTRAINT "procedure_etape_id_etape_fkey" FOREIGN KEY ("id_etape") REFERENCES "etape_proc"("id_etape") ON DELETE RESTRICT ON UPDATE CASCADE;
