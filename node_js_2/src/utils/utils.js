// La funcio slugify es logica de negoci pura, per aixo viu aqui i no al repositori
const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")                   // Separa les lletres dels seus accents
    .replace(/[\u0300-\u036f]/g, "")     // Elimina els accents
    .toLowerCase()                       // Converteix tot a minuscules
    .trim()                              // Treu espais al principi i al final
    .replace(/[^a-z0-9\s-]/g, "")        // Esborra tot el que no sigui lletra, numero, espai o guio
    .replace(/[\s-]+/g, "-");            // Substitueix espais o multiples guions per un unic guio
};

module.exports = {
  slugify
};
