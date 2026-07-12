const prisma = require("../config/db");

const findAll = async () => {
  return await prisma.section.findMany({
    include: { mainNews: true, news: true, activities: true },
    orderBy: { createdAt: 'desc' }
  });
};

const findById = async (id) => {
  return await prisma.section.findUnique({
    where: { id },
    include: { mainNews: true, news: true, activities: true }
  });
};

const createWithMainNews = async (sectionData, newsData) => {
  // La transacción (lógica de base de datos) se queda en el repositorio
  return await prisma.$transaction(async (tx) => {
    const newSection = await tx.section.create({ data: sectionData });
    newsData.section = { connect: { id: newSection.id } }; // Conectamos la noticia a la sección

    const defaultNews = await tx.news.create({ data: newsData });

    return await tx.section.update({
      where: { id: newSection.id },
      data: { mainNews: { connect: { id: defaultNews.id } } },
      include: { mainNews: true, news: true, activities: true }
    });
  });
};

const update = async (id, dataToUpdate) => {
  return await prisma.section.update({
    where: { id },
    data: dataToUpdate,
    include: { mainNews: true, news: true, activities: true }
  });
};

module.exports = { findAll, findById, createWithMainNews, update };