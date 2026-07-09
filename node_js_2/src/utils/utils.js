// La función slugify es lógica de negocio pura, se viene al servicio
const slugify = (texto) => {
  if (!texto) return "";
  return texto
    .toString()
    .normalize("NFD")                   // Separa las letras de sus acentos
    .replace(/[\u0300-\u036f]/g, "")    // Elimina los acentos
    .toLowerCase()                      // Convierte todo a minúsculas
    .trim()                             // Quita espacios al principio y al final
    .replace(/[^a-z0-9\s-]/g, "")       // Borra todo lo que no sea letra, número, espacio o guion
    .replace(/[\s-]+/g, "-");           // Reemplaza espacios o múltiples guiones por un solo guion
};

module.exports = {
  slugify
};