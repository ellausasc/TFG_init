/*
  Warnings:

  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Section";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "Noticia" (
    "id" SERIAL NOT NULL,
    "codi" TEXT NOT NULL,
    "titol" TEXT NOT NULL,
    "descripcioCurta" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "dataCreacio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPublicacio" TIMESTAMP(3),
    "publica" BOOLEAN NOT NULL DEFAULT false,
    "informacioPrivada" TEXT,
    "autor" TEXT NOT NULL,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Noticia_codi_key" ON "Noticia"("codi");
