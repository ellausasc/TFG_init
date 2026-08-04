// src/utils.ts

const REST_UPLOAD_URL = "http://localhost:4000/upload"; // Endpoint de MinIO

/**
 * Puja un arxiu generic al servidor (MinIO) via REST
 * @param file L'arxiu binari a pujar (File)
 * @param visibility "public" (per defecte, imatges i contingut obert) o
 *   "private" (adjunts confidencials de Juntes, vegeu memoria CU-12/RF-3.7)
 * @returns La URI/clau de l'arxiu desat a la base de dades
 */
export async function uploadGenericFile(
  file: File,
  visibility: "public" | "private" = "public",
): Promise<string> {
  const formData = new FormData();
  // El nom "file" ha de coincidir amb el que espera multer al backend: upload.single("file")
  formData.append("file", file);
  formData.append("visibility", visibility);

  const response = await fetch(REST_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Error pujant l'arxiu al servidor.");
  }

  // Retornem la URI relativa generada
  return result.document.url;
}

/**
 * Puja un fitxer generic i retorna les tres dades necessaries per adjuntar-lo
 * a una activitat com a document (vegeu AttachmentInput a l'esquema GraphQL).
 */
export async function uploadAttachment(
  file: File,
  visibility: "public" | "private" = "public",
): Promise<{ name: string; url: string; type: string }> {
  const url = await uploadGenericFile(file, visibility);
  return { name: file.name, url, type: file.type || "application/octet-stream" };
}
