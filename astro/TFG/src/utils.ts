// src/utils.ts

const REST_UPLOAD_URL = "http://localhost:4000/upload"; // Endpoint de MinIO

/**
 * Puja un arxiu generic al servidor (MinIO) via REST
 * @param file L'arxiu binari a pujar (File)
 * @returns La URI relativa de l'arxiu desat a la base de dades
 */
export async function uploadGenericFile(file: File): Promise<string> {
  const formData = new FormData();
  // El nom "file" ha de coincidir amb el que espera multer al backend: upload.single("file")
  formData.append("file", file);

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
