const prisma = require("../../db");

// Función de ayuda para formatear los datos de Prisma hacia GraphQL
const formatNews = (news) => {
  if (!news) return null;
  return {
    ...news,
    // Reconstruimos el objeto image para el frontend
    image: { src: news.image_src, alt: news.image_alt },
    // Formateamos las fechas a String (ISO)
    creation_date: news.creation_date.toISOString(),
    publication_date: news.publication_date.toISOString(),
  };
};

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
  Query: {
    getAllNews: async () => {
      const allNews = await prisma.news.findMany({
        orderBy: { publication_date: 'desc' },
      });
      return allNews.map(formatNews);
    },
    getNewsBySlug: async (_, { slug }) => {
      const news = await prisma.news.findUnique({ where: { slug } });
      return formatNews(news);
    }
  },

  Mutation: {
    // 1. CREAR NOTICIA
    createNews: async (_, { input }) => {
      await prisma.$executeRaw`SELECT setval('"News_new_id_seq"', (SELECT MAX(new_id) FROM "News"));`
      // Generamos el slug automáticamente a partir del título
      const generatedSlug = slugify(input.title);

      const existingNews = await prisma.news.findUnique({
        where: { slug: generatedSlug },
      });

      if (existingNews) {
        console.log(existingNews);
        throw new Error("Ja existeix una notícia amb un títol similar.");
      }

      const newNews = await prisma.news.create({
        data: {
          title: input.title,
          short_descr: input.short_descr,
          sections: input.sections,
          publication_date: new Date(input.publication_date),
          public: input.public !== undefined ? input.public : false,
          author: input.author,
          slug: generatedSlug, // Usamos el slug generado
          image_src: "",
          image_alt: "",
        },
      });

      return formatNews(newNews);
    },

    // 2. MODIFICAR NOTICIA
    updateNews: async (_, { id, input }) => {
      const numericId = parseInt(id, 10);
      const dataToUpdate = { ...input };

      // Si el título cambia, recalculamos el slug
      if (input.title) {
        dataToUpdate.slug = slugify(input.title);
        
        // Comprobamos que el nuevo slug generado no pise a otra noticia existente
        const existingSlug = await prisma.news.findFirst({
          where: {
            slug: dataToUpdate.slug,
            NOT: { new_id: numericId },
          },
        });
        
        if (existingSlug) {
          throw new Error("El títol nou genera una URL que ja està sent utilitzada per una altra notícia.");
        }
      } else if (input.slug) {
        // Si no cambian el título pero envían un slug manual (opcional), también lo normalizamos
        dataToUpdate.slug = slugify(input.slug);
      }

      if (input.publication_date) {
        dataToUpdate.publication_date = new Date(input.publication_date);
      }

      const updatedNews = await prisma.news.update({
        where: { new_id: numericId },
        data: dataToUpdate,
      });

      return formatNews(updatedNews);
    },
  }
};