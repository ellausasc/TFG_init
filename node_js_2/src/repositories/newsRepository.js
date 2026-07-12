// src/repositories/newsRepository.js
const prisma = require("../config/db"); 

const findAll = async () => {
  return await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { author: true, section: true }
  });
};

const findBySlug = async (slug) => {
  return await prisma.news.findUnique({
    where: { slug },
    include: { author: true, section: true }
  });
};

const findById = async (id) => {
  return await prisma.news.findUnique({
    where: { id },
    include: { author: true, section: true }
  });
};

const findFiltered = async (where, orderBy, skip, take) => {
  const [items, totalCount] = await prisma.$transaction([
    prisma.news.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { author: true, section: true }
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
    include: { author: true, section: true }
  });
};

const update = async (id, data) => {
  return await prisma.news.update({
    where: { id },
    data,
    include: { author: true, section: true, tags: true } 
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