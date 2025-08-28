-- CreateTable
CREATE TABLE "permis_templates" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "elements" JSONB NOT NULL,
    "typePermisId" INTEGER NOT NULL,
    "permisId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "permis_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "permis_templates_typePermisId_idx" ON "permis_templates"("typePermisId");

-- CreateIndex
CREATE INDEX "permis_templates_permisId_idx" ON "permis_templates"("permisId");

-- AddForeignKey
ALTER TABLE "permis_templates" ADD CONSTRAINT "permis_templates_typePermisId_fkey" FOREIGN KEY ("typePermisId") REFERENCES "typepermis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permis_templates" ADD CONSTRAINT "permis_templates_permisId_fkey" FOREIGN KEY ("permisId") REFERENCES "permis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
