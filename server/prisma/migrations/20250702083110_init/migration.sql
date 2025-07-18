-- CreateTable
CREATE TABLE "ZoneInterdite" (
    "id_zone" SERIAL NOT NULL,
    "nom_zone" TEXT NOT NULL,
    "type_zone" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "commentaire" TEXT,

    CONSTRAINT "ZoneInterdite_pkey" PRIMARY KEY ("id_zone")
);

-- CreateTable
CREATE TABLE "Coordonnee" (
    "id_coordonnees" SERIAL NOT NULL,
    "id_demande" INTEGER NOT NULL,
    "id_zone_interdite" INTEGER NOT NULL,
    "point" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "z" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Coordonnee_pkey" PRIMARY KEY ("id_coordonnees")
);

-- AddForeignKey
ALTER TABLE "Coordonnee" ADD CONSTRAINT "Coordonnee_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordonnee" ADD CONSTRAINT "Coordonnee_id_zone_interdite_fkey" FOREIGN KEY ("id_zone_interdite") REFERENCES "ZoneInterdite"("id_zone") ON DELETE RESTRICT ON UPDATE CASCADE;
