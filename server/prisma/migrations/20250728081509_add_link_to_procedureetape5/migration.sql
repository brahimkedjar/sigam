/*
  Warnings:

  - A unique constraint covering the columns `[id_seance,numero_decision]` on the table `ComiteDirection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ComiteDirection_id_seance_numero_decision_key" ON "ComiteDirection"("id_seance", "numero_decision");
