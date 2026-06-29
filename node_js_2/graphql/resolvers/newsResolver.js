// Importamos TODO el servicio de noticias (Fíjate que ya NO importamos Prisma aquí)
const newsService = require("../../services/newsServices");

// El formateo de fechas se queda aquí porque es una necesidad específica de GraphQL
const formatNews = (news) => {
  if (!news) return null;
  return {
    ...news,
    createdAt: news.createdAt ? news.createdAt.toISOString() : null,
    publishedAt: news.publishedAt ? news.publishedAt.toISOString() : null,
  };
};

module.exports = {
  Query: {
    getAllNews: async () => {
      const allNews = await newsService.getAll();
      return allNews.map(formatNews);
    },
    
    getNewsBySlug: async (_, { slug }) => {
      const news = await newsService.getBySlug(slug);
      return formatNews(news);
    },

    getNewsFiltered: async (_, { filter, sort, page, limit }) => {
      const filteredNews = await newsService.getFiltered({ filter, sort, page, limit });
      return {
        items: filteredNews.items.map(formatNews),
        totalCount: filteredNews.totalCount,
      };
    },
  },

  Mutation: {
    createNews: async (_, { input }, context) => {
      // Pasamos el input y el userId al servicio
      const newNews = await newsService.create(input, context.userId);
      return formatNews(newNews);
    },

    updateNews: async (_, { id, input }) => {
      // Pasamos el id y el input al servicio
      const updatedNews = await newsService.update(id, input);
      return formatNews(updatedNews);
    },
  }
};