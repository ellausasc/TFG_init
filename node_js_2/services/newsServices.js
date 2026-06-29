const utils = require("./utils");

const prisma = require("../db");

const getAll = async () => {
  return await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    include: {
      author: true,
      section: true,
      tags: true
    }
  });
};

const getBySlug = async (slug) => {
  return await prisma.news.findUnique({
    where: { slug },
    include: {
      author: true,
      section: true,
      tags: true
    }
  });
};

const getById = async (id) => {
  return await prisma.news.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: true,
      section: true,
      tags: true
    }
  });
};

const getFiltered = async ({ filter, sort, page, limit }) => {
  const currentPage = page || 1;
  const pageSize = limit || 10;
  const skip = (currentPage - 1) * pageSize;

  const where = {
    mainPageOfId: null, // Excluimos las noticias que son la noticia principal de alguna sección
  };
  if (filter) {
    if (filter.title) where.title = { contains: filter.title, mode: 'insensitive' };
    if (filter.sectionId) where.sectionId = parseInt(filter.sectionId);
    if (filter.authorId) where.authorId = parseInt(filter.authorId);
    if (filter.tagIds && filter.tagIds.length > 0) {
      where.tags = { some: { id: { in: filter.tagIds.map(id => parseInt(id)) } } };
    }
  }

  const orderBy = {};
  if (sort) {
    const field = sort.field === 'author' ? 'authorId' : (sort.field || 'publishedAt');
    orderBy[field] = sort.direction === 'ASC' ? 'asc' : 'desc';
  } else {
    orderBy.publishedAt = 'desc';
  }

  const [items, totalCount] = await prisma.$transaction([
    prisma.news.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: { author: true, section: true, tags: true }
    }),
    prisma.news.count({ where })
  ]);

  return { items, totalCount };
};

const create = async (input, userId) => {
  if (!userId) {
    throw new Error("No estàs autenticat. Has d'iniciar sessió per crear notícies.");
  }

  const generatedSlug = utils.slugify(input.title);

  const existingNews = await prisma.news.findUnique({
    where: { slug: generatedSlug },
  });

  if (existingNews) {
    throw new Error("Ja existeix una notícia amb un títol similar.");
  }

  return await prisma.news.create({
    data: {
      title: input.title,
      shortDescription: input.shortDescription,
      longDescription: input.longDescription,
      status: input.status,
      type: input.type,
      mainImage: input.mainImage || "",
      secondaryImage: input.secondaryImage || "",
      slug: generatedSlug,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      
      author: { connect: { id: userId } },
      section: { connect: { id: parseInt(input.sectionId) } },
      
      tags: input.tagIds && input.tagIds.length > 0 
        ? { connect: input.tagIds.map(id => ({ id: parseInt(id) })) }
        : undefined
    },
    include: { author: true, section: true, tags: true }
  });
};

const update = async (id, input) => {
  const numericId = parseInt(id, 10);
  const dataToUpdate = { ...input };

  if (input.title) {
    dataToUpdate.slug = utils.slugify(input.title);
    
    const existingSlug = await prisma.news.findFirst({
      where: {
        slug: dataToUpdate.slug,
        NOT: { id: numericId }, 
      },
    });
    
    if (existingSlug) {
      throw new Error("El títol nou genera una URL que ja està sent utilitzada per una altra notícia.");
    }
  } else if (input.slug) {
    dataToUpdate.slug = utils.slugify(input.slug);
  }

  if (input.sectionId) {
    dataToUpdate.section = { connect: { id: parseInt(input.sectionId) } };
    delete dataToUpdate.sectionId;
  }

  if (input.tagIds) {
    dataToUpdate.tags = { set: input.tagIds.map(tagId => ({ id: parseInt(tagId) })) };
    delete dataToUpdate.tagIds;
  }

  return await prisma.news.update({
    where: { id: numericId },
    data: dataToUpdate,
    include: { author: true, section: true, tags: true }
  });
};

// Exportamos todas las funciones (incluido slugify por si lo necesitas en otro sitio)
module.exports = {
  getAll,
  getBySlug,
  getById,
  getFiltered,
  create,
  update
};