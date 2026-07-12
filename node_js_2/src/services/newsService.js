const utils = require("../utils/utils");
const newsRepository = require("../repositories/newsRepository");

const getAll = async () => {
  return await newsRepository.findAll();
};

const getBySlug = async (slug) => {
  return await newsRepository.findBySlug(slug);
};

const getById = async (id) => {
  return await newsRepository.findById(parseInt(id, 10));
};

const getFiltered = async ({ filter, sort, page, limit }) => {
  // Logica de calcul de paginacio
  const currentPage = page || 1;
  const pageSize = limit || 10;
  const skip = (currentPage - 1) * pageSize;
  
  const where = {
    mainPageOfId: null,
  };

  // Construccio dinamica de filtres
  if (filter) {
    if (filter.title) where.title = { contains: filter.title, mode: 'insensitive' };
    if (filter.sectionId) where.sectionId = parseInt(filter.sectionId);
    if (filter.authorId) where.authorId = parseInt(filter.authorId);
  }

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
    mainImage: input.mainImage || "",
    secondaryImage: input.secondaryImage || "",
    slug: generatedSlug,
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
    author: { connect: { id: userId } },
    section: { connect: { id: parseInt(input.sectionId) } },
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