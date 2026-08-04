const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const prisma = require("./db");

const JWT_SECRET = process.env.JWT_SECRET || 'XX';

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
    const savedDocument = await prisma.document.create({
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

// 7. Endpoint de descarrega segura de documents (CU-07, CU-12, RF-2.4, RF-3.7)
//
// Els documents adjunts a Juntes/Assemblees (actes, convocatories) no es
// desen amb una URL publica com les imatges: cal validar la sessio abans
// de servir-los i, si l'activitat es confidencial, comprovar que l'usuari
// tingui permis explicit sobre el modul ASSEMBLY (vegeu memoria, RF-3.7).
//
// hasAssemblyPermission() reprodueix, de manera simplificada, la mateixa
// logica de `can`/`hasModulePermission` de graphql-shield (rules.js), pero
// aplicada aqui perque aquest endpoint es REST (Express), no GraphQL.
const hasAssemblyPermission = (userPermissions, sectionId) => {
  const perms = userPermissions || [];
  if (perms.includes('ASSEMBLY:*')) return true;
  if (sectionId !== undefined && sectionId !== null) {
    if (perms.includes(`ASSEMBLY:*:${sectionId}`)) return true;
    if (perms.includes(`ASSEMBLY:03:${sectionId}`)) return true;
  }
  return false;
};

router.get("/documents/:id/download", async (req, res) => {
  try {
    const documentId = parseInt(req.params.id, 10);
    if (Number.isNaN(documentId)) {
      return res.status(400).json({ error: "Identificador de document invalid." });
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { activity: true },
    });

    if (!document) {
      return res.status(404).json({ error: "Document no trobat." });
    }

    // Les imatges (perfil, noticies, seccions, activitats) i qualsevol
    // document sense activitat associada ja es desen al bucket public:
    // no cal cap comprovacio addicional, redirigim directament a la URL.
    if (!document.activityId || !document.activity) {
      return res.redirect(document.url);
    }

    const activity = document.activity;

    // Els adjunts de Juntes/Assemblees nomes son accessibles per usuaris
    // autenticats (RF-2.4: "El sistema ha de permetre als socis...").
    const token = req.cookies?.token;
    let userPermissions = [];
    if (!token) {
      return res.status(401).json({ error: "Cal iniciar sessió per descarregar aquest document." });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userPermissions = decoded.userPermissions || [];
    } catch (err) {
      return res.status(401).json({ error: "Sessió no vàlida o caducada." });
    }

    // Si l'activitat es confidencial, nomes hi accedeixen els usuaris amb
    // permis explicit sobre el modul ASSEMBLY (RF-3.7).
    if (activity.isPrivate && !hasAssemblyPermission(userPermissions, activity.sectionId)) {
      return res.status(403).json({ error: "No tens permís per descarregar aquest document confidencial." });
    }

    // Si la URL desada ja es absoluta (bucket public), redirigim directament.
    if (/^https?:\/\//i.test(document.url)) {
      return res.redirect(document.url);
    }

    // Altrament, `document.url` es nomes la Key dins del bucket privat
    // (vegeu POST /upload): generem una URL prefirmada de curta durada.
    const command = new GetObjectCommand({
      Bucket: "private-docs",
      Key: document.url,
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return res.redirect(signedUrl);
  } catch (error) {
    console.error("Error en la descàrrega del document:", error);
    return res.status(500).json({ error: "Error intern en processar la descàrrega." });
  }
});

module.exports = router;