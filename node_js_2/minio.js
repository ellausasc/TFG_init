const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const prisma = require("./db"); // Assegura't d'importar Prisma aquí

// 1. Creamos el Router de Express
const router = express.Router();

// 2. Configuramos el cliente de MinIO
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  endpoint: process.env.MINIO_ENDPOINT,
  forcePathStyle: true, // Obligatori per a MinIO
});

// 3. Configuramos Multer para la memoria RAM
const upload = multer({ storage: multer.memoryStorage() });

// 4. Definimos el endpoint unificado
router.post("/upload", upload.single("archivo"), async (req, res) => {
  try {
    const file = req.file;
    // Llegim el camp de visibilitat des del body (per defecte el fem públic si no s'envia res)
    const visibility = req.body.visibility || "public"; 

    if (!file) {
      return res.status(400).json({ error: "No se encontró ningún archivo en la petición." });
    }

    const nombreLimpio = file.originalname.replace(/\s+/g, "_");
    const fileName = `${Date.now()}-${nombreLimpio}`;
    
    // 5. Lògica d'enrutament (Bucket Públic vs Privat)
    const isPrivate = visibility === "private";
    const bucketName = isPrivate ? "private-docs" : process.env.MINIO_PUBLIC_BUCKET_NAME;

    // Subir a MinIO al bucket corresponent
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    // 6. Generar el valor a guardar a la base de dades
    const endpoint = process.env.MINIO_ENDPOINT;
    
    // ATENCIÓ: Si és públic guardem la URL sencera. 
    // Si és privat, només guardem el Key (fileName) per generar la Presigned URL en el futur.
    const urlParaGuardar = isPrivate 
      ? fileName 
      : `${endpoint}/${bucketName}/${fileName}`;

    // Guardar en base de datos
    const documentoGuardado = await prisma.documents.create({
      data: {
        nombre: file.originalname,
        url: urlParaGuardar,
        tipo: file.mimetype,
      },
    });

    res.status(200).json({ 
      success: true, 
      documento: documentoGuardado,
      url: urlParaGuardar // Retornem la dada perquè el frontend la pugui utilitzar immediatament
    });

  } catch (error) {
    console.error("Error al subir el archivo a MinIO:", error);
    res.status(500).json({ error: "Fallo interno al procesar el documento." });
  }
});

// 5. Exportamos el Router
module.exports = router;