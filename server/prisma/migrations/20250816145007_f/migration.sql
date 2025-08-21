-- CreateTable
CREATE TABLE "permis_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "elements" JSONB NOT NULL,
    "typePermisId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permis_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "permis_templates" ADD CONSTRAINT "permis_templates_typePermisId_fkey" FOREIGN KEY ("typePermisId") REFERENCES "typepermis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
