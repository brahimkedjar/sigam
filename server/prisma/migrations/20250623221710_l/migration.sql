-- CreateTable
CREATE TABLE "Ingenieur" (
    "id_ingenieur" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "fonction" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Ingenieur_pkey" PRIMARY KEY ("id_ingenieur")
);
