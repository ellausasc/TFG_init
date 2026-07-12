// Importem tot el servei de noticies (ja no importem Prisma directament aqui)
const newsService = require("../../services/newsService");

// El formateig de dates es queda aqui perque es una necessitat especifica de GraphQL
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
      // Passem l'input i l'userId al servei
      const newNews = await newsService.create(input, context.userId);
      return formatNews(newNews);
    },

    updateNews: async (_, { id, input }) => {
      // Passem l'id i l'input al servei
      const updatedNews = await newsService.update(id, input);
      return formatNews(updatedNews);
    },
  }
};