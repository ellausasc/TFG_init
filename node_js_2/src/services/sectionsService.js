const utils = require("../utils/utils");
const sectionsRepository = require("../repositories/sectionsRepository");

const getAll = async () => await sectionsRepository.findAll();
const getById = async (id) => await sectionsRepository.findById(parseInt(id, 10));

const create = async (input, userId) => {
  if (!userId) throw new Error("No estàs autenticat. Has d'iniciar sessió.");

  const sectionData = {
    name: input.name,
    description: input.description,
    isActive: input.isActive !== undefined ? input.isActive : true,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
  };

  const newsInput = input.mainNews;
  const generatedSlug = utils.slugify(`${newsInput.title}-${Date.now()}`);

  const newsData = {
    title: newsInput.title,
    shortDescription: newsInput.shortDescription,
    longDescription: newsInput.longDescription,
    status: newsInput.status !== undefined ? newsInput.status : true,
    type: newsInput.type,
    mainImage: newsInput.mainImage || "",
    secondaryImage: newsInput.secondaryImage || "",
    publishedAt: newsInput.status !== false ? new Date() : null,
    slug: generatedSlug,
    author: { connect: { id: userId } },
    tags: newsInput.tagIds && newsInput.tagIds.length > 0 
      ? { connect: newsInput.tagIds.map(id => ({ id: parseInt(id, 10) })) }
      : undefined
  };

  return await sectionsRepository.createWithMainNews(sectionData, newsData);
};

const update = async (id, input, userId) => {
  if (!userId) throw new Error("No estàs autenticat. Has d'iniciar sessió.");

  const { mainNews, mainNewsId, ...sectionData } = input;
  const dataToUpdate = { ...sectionData };

  if (dataToUpdate.publishedAt) dataToUpdate.publishedAt = new Date(dataToUpdate.publishedAt);

  if (mainNews) {
    dataToUpdate.mainNews = {
      update: {
        title: mainNews.title,
        shortDescription: mainNews.shortDescription,
        longDescription: mainNews.longDescription,
        status: mainNews.status,
        type: mainNews.type
      }
    };
  } else if (mainNewsId) {
    dataToUpdate.mainNews = { connect: { id: parseInt(mainNewsId, 10) } };
  }

  return await sectionsRepository.update(parseInt(id, 10), dataToUpdate);
};

module.exports = { getAll, getById, create, update };