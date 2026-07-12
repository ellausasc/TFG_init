-- Renombra els camps "nombre" i "tipo" del model Documents a l'angles ("name" i "type")
-- per mantenir la coherencia d'idioma entre el codi i l'esquema de la base de dades.
ALTER TABLE "Documents" RENAME COLUMN "nombre" TO "name";
ALTER TABLE "Documents" RENAME COLUMN "tipo" TO "type";
