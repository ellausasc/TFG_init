const utils = require("../utils/utils");
const newsRepository = require("../repositories/newsRepository");

// Condicio que defineix qu es "public" per a una noticia
const PUBLIC_CONDITION = { status: 'PUBLISHED' };

// La News de Prisma no te camps escalars "mainImage"/"secondaryImage": les
// imatges es guarden com a registres de la relacio `documents`, diferenciats
// pel seu `usage` (MAIN_IMAGE / SECONDARY_IMAGE).
const buildImageDocuments = (input) => {
  const documents = [];
  if (input.mainImage) {
    documents.push({ name: 'Imatge principal', url: input.mainImage, type: 'image', usage: 'MAIN_IMAGE' });
  }
  if (input.secondaryImage) {
    documents.push({ name: 'Imatge secundaria', url: input.secondaryImage, type: 'image', usage: 'SECONDARY_IMAGE' });
  }
  return documents;
};

const getAll = async (visibility) => {
  const where = utils.applyVisibilityFilter({}, visibility, PUBLIC_CONDITION);
  return await newsRepository.findAll(where);
};

const getBySlug = async (slug, visibility) => {
  const where = utils.applyVisibilityFilter({}, visibility, PUBLIC_CONDITION);
  return await newsRepository.findBySlug(slug, where);
};

const getById = async (id, visibility) => {
  const where = utils.applyVisibilityFilter({}, visibility, PUBLIC_CONDITION);
  return await newsRepository.findById(parseInt(id, 10), where);
};

const getFiltered = async ({ filter, sort, page, limit }, visibility) => {
  // Logica de calcul de paginacio
  const currentPage = page || 1;
  const pageSize = limit || 10;
  const skip = (currentPage - 1) * pageSize;

  let where = {};

  // Construccio dinamica de filtres
  if (filter) {
    if (filter.title) where.title = { contains: filter.title, mode: 'insensitive' };
    if (filter.sectionId) where.sectionId = parseInt(filter.sectionId);
    if (filter.authorId) where.authorId = parseInt(filter.authorId);
    if (filter.excludeSectionMain) where.mainPageOf = { is: null };
    if (filter.onlyPublished) where.status = 'PUBLISHED';
  }
  where = utils.applyVisibilityFilter(where, visibility, PUBLIC_CONDITION);

  // Construccio dinamica d'ordenacio
  const orderBy = {};
  if (sort) {
    const field = sort.field === 'author' ? 'authorId' : (sort.field || 'publishedAt');
    orderBy[field] = sort.direction === 'ASC' ? 'asc' : 'desc';
  } else {
    orderBy.publishedAt = 'desc';
  }

  // Deleguem la consulta a la base de dades al repositori
  return await newsRepository.findFiltered(where, orderBy, skip, pageSize);
};

const create = async (input, userId) => {
  // Logica de negoci 1: Verificar autenticacio
  if (!userId) {
    throw new Error("No estàs autenticat. Has d'iniciar sessió per crear notícies.");
  }

  // Logica de negoci 2: Generar slug
  const generatedSlug = utils.slugify(input.title);

  // Logica de negoci 3: Verificar unicitat del slug
  const existingNews = await newsRepository.findBySlug(generatedSlug);
  if (existingNews) {
    throw new Error("Ja existeix una notícia amb un títol similar.");
  }

  // Mapeig de les dades per a la base de dades
  const dataToCreate = {
    title: input.title,
    shortDescription: input.shortDescription,
    longDescription: input.longDescription,
    status: input.status,
    type: input.type,
    slug: generatedSlug,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
    author: { connect: { id: userId } },
    section: { connect: { id: parseInt(input.sectionId) } },
    documents: { create: buildImageDocuments(input) },
  };

  // Deleguem l'escriptura al repositori
  return await newsRepository.create(dataToCreate);
};

const update = async (id, input) => {
  const numericId = parseInt(id, 10);
  const dataToUpdate = { ...input };
  // Logica de negoci per gestionar canvis de titol o slug
  if (input.title) {
    dataToUpdate.slug = utils.slugify(input.title);
    
    const existingSlug = await newsRepository.findSlugExceptId(dataToUpdate.slug, numericId);
    if (existingSlug) {
      throw new Error("El títol nou genera una URL que ja està sent utilitzada per una altra notícia.");
    }
  } else if (input.slug) {
    dataToUpdate.slug = utils.slugify(input.slug);
  }

  // Logica de mapeig per a relacions
  if (input.sectionId) {
    dataToUpdate.section = { connect: { id: parseInt(input.sectionId) } };
    delete dataToUpdate.sectionId;
  }

  // mainImage/secondaryImage no son camps escalars a Prisma: si venen a
  // l'input, substituim el document existent d'aquell usage (si n'hi ha) pel nou
  const usagesToReplace = [];
  if (input.mainImage !== undefined) usagesToReplace.push('MAIN_IMAGE');
  if (input.secondaryImage !== undefined) usagesToReplace.push('SECONDARY_IMAGE');

  if (usagesToReplace.length > 0) {
    dataToUpdate.documents = {
      deleteMany: { usage: { in: usagesToReplace } },
      create: buildImageDocuments(input),
    };
  }
  delete dataToUpdate.mainImage;
  delete dataToUpdate.secondaryImage;

  // Deleguem l'actualitzacio
  return await newsRepository.update(numericId, dataToUpdate);
};

module.exports = {
  getAll,
  getBySlug,
  getById,
  getFiltered,
  create,
  update
};