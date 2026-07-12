const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const prisma = require("./db");

// 1. Creem el Router d'Express
const router = express.Router();

// 2. Configurem el client de MinIO
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  endpoint: process.env.MINIO_ENDPOINT,
  forcePathStyle: true, // Obligatori per a MinIO
});

// 3. Configurem Multer per a la memoria RAM
const upload = multer({ storage: multer.memoryStorage() });

// 4. Definim l'endpoint unificat
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    // Llegim el camp de visibilitat des del body (per defecte el fem public si no s'envia res)
    const visibility = req.body.visibility || "public";

    if (!file) {
      return res.status(400).json({ error: "No s'ha trobat cap arxiu a la peticio." });
    }

    const sanitizedFileName = file.originalname.replace(/\s+/g, "_");
    const fileName = `${Date.now()}-${sanitizedFileName}`;

    // 5. Logica d'enrutament (Bucket Public vs Privat)
    const isPrivate = visibility === "private";
    const bucketName = isPrivate ? "private-docs" : process.env.MINIO_PUBLIC_BUCKET_NAME;

    // Pugem a MinIO al bucket corresponent
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // 6. Generem el valor a desar a la base de dades
    const endpoint = process.env.MINIO_ENDPOINT;

    // ATENCIO: Si es public desem la URL sencera.
    // Si es privat, nomes desem la Key (fileName) per generar la Presigned URL en el futur.
    const urlToSave = isPrivate
      ? fileName
      : `${endpoint}/${bucketName}/${fileName}`;

    // Desem a la base de dades
    const savedDocument = await prisma.documents.create({
      data: {
        name: file.originalname,
        url: urlToSave,
        type: file.mimetype,
      },
    });

    res.status(200).json({
      success: true,
      document: savedDocument,
      url: urlToSave // Retornem la dada perque el frontend la pugui utilitzar immediatament
    });

  } catch (error) {
    console.error("Error en pujar l'arxiu a MinIO:", error);
    res.status(500).json({ error: "Error intern en processar el document." });
  }
});

module.exports = router;
