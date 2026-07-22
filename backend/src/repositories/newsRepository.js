const prisma = require("../config/db"); 

const findAll = async (where = {}) => {
  return await prisma.news.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    include: { author: true, section: true, documents: true }
  });
};

const findBySlug = async (slug, where = {}) => {
  return await prisma.news.findFirst({
    where: { slug, ...where },
    include: { author: true, section: true, documents: true }
  });
};

const findById = async (id, where = {}) => {
  return await prisma.news.findFirst({
    where: { id, ...where },
    include: { author: true, section: true, documents: true }
  });
};

const findFiltered = async (where, orderBy, skip, take) => {
  const [items, totalCount] = await prisma.$transaction([
    prisma.news.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { author: true, section: true, documents: true }
    }),
    prisma.news.count({ where })
  ]);
  return { items, totalCount };
};

const findSlugExceptId = async (slug, idToExclude) => {
  return await prisma.news.findFirst({
    where: {
      slug: slug,
      NOT: idToExclude ? { id: idToExclude } : undefined,
    },
  });
};

const create = async (data) => {
  return await prisma.news.create({
    data, 
    include: { author: true, section: true, documents: true }
  });
};

const update = async (id, data) => {
  return await prisma.news.update({
    where: { id },
    data,
    include: { author: true, section: true, documents: true } 
  });
};

module.exports = {
  findAll,
  findBySlug,
  findById,
  findFiltered,
  findSlugExceptId,
  create,
  update
};