// Importem tot el servei de noticies (ja no importem Prisma directament aqui)
const newsService = require("../../services/newsService");
const { getVisibility } = require("../../utils/utils");

// El formateig de dates es queda aqui perque es una necessitat especifica de GraphQL.
// A mes, com que Prisma no te camps escalars "mainImage"/"secondaryImage" a
// News (es guarden com a Document amb usage MAIN_IMAGE/SECONDARY_IMAGE),
// aqui es reconstrueixen aquests dos camps plans que espera l'esquema GraphQL.
const formatNews = (news) => {
  if (!news) return null;
  const documents = news.documents || [];
  const mainImageDoc = documents.find((doc) => doc.usage === 'MAIN_IMAGE');
  const secondaryImageDoc = documents.find((doc) => doc.usage === 'SECONDARY_IMAGE');

  return {
    ...news,
    createdAt: news.createdAt ? news.createdAt.toISOString() : null,
    publishedAt: news.publishedAt ? news.publishedAt.toISOString() : null,
    mainImage: mainImageDoc ? mainImageDoc.url : null,
    secondaryImage: secondaryImageDoc ? secondaryImageDoc.url : null,
  };
};

module.exports = {
  Query: {
    getAllNews: async (_, __, context) => {
      const allNews = await newsService.getAll(getVisibility(context));
      return allNews.map(formatNews);
    },

    getNewsBySlug: async (_, { slug }, context) => {
      const news = await newsService.getBySlug(slug, getVisibility(context));
      return formatNews(news);
    },

    getNewsFiltered: async (_, { filter, sort, page, limit }, context) => {
      const filteredNews = await newsService.getFiltered({ filter, sort, page, limit }, getVisibility(context));
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