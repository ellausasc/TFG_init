// src/utils.ts (o src/utils/index.ts)

const REST_UPLOAD_URL = "http://localhost:4000/upload"; // Endpoint de MinIO

/**
 * Sube un archivo genérico al servidor (MinIO) vía REST
 * @param file El archivo binario a subir (File)
 * @returns La URI relativa del archivo guardado en la base de datos
 */
export async function uploadGenericFile(file: File): Promise<string> {
  const formData = new FormData();
  // El nombre "archivo" debe coincidir con lo que espera multer en el backend: upload.single("archivo")
  formData.append("archivo", file);

  const response = await fetch(REST_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Error pujant l'arxiu al servidor.");
  }

  // Devolvemos la URI relativa generada
  return result.documento.url; 
}