// src/services/newsService.js
const utils = require("../utils/utils"); // 
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
  // Lógica de cálculo de paginación
  const currentPage = page || 1;
  const pageSize = limit || 10;
  const skip = (currentPage - 1) * pageSize;
  
  const where = {
    mainPageOfId: null,
  };

  // Construcción dinámica de filtros
  if (filter) {
    if (filter.title) where.title = { contains: filter.title, mode: 'insensitive' };
    if (filter.sectionId) where.sectionId = parseInt(filter.sectionId);
    if (filter.authorId) where.authorId = parseInt(filter.authorId);
  }

  // Construcción dinámica de ordenación
  const orderBy = {};
  if (sort) {
    const field = sort.field === 'author' ? 'authorId' : (sort.field || 'publishedAt');
    orderBy[field] = sort.direction === 'ASC' ? 'asc' : 'desc';
  } else {
    orderBy.publishedAt = 'desc';
  }

  // Delegamos la consulta a la base de datos al repositorio
  return await newsRepository.findFiltered(where, orderBy, skip, pageSize);
};

const create = async (input, userId) => {
  // Lógica de negocio 1: Verificar autenticación
  if (!userId) {
    throw new Error("No estàs autenticat. Has d'iniciar sessió per crear notícies.");
  }

  // Lógica de negocio 2: Generar slug
  const generatedSlug = utils.slugify(input.title);

  // Lógica de negocio 3: Verificar unicidad del slug
  const existingNews = await newsRepository.findBySlug(generatedSlug);
  if (existingNews) {
    throw new Error("Ja existeix una notícia amb un títol similar.");
  }

  // Mapeo de los datos para la base de datos
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

  // Delegamos la escritura al repositorio
  return await newsRepository.create(dataToCreate);
};

const update = async (id, input) => {
  const numericId = parseInt(id, 10);
  const dataToUpdate = { ...input };
  // Lógica de negocio para manejar cambios de título o slug
  if (input.title) {
    dataToUpdate.slug = utils.slugify(input.title);
    
    const existingSlug = await newsRepository.findSlugExceptId(dataToUpdate.slug, numericId);
    if (existingSlug) {
      throw new Error("El títol nou genera una URL que ja està sent utilitzada per una altra notícia.");
    }
  } else if (input.slug) {
    dataToUpdate.slug = utils.slugify(input.slug);
  }

  // Lógica de mapeo para relaciones
  if (input.sectionId) {
    dataToUpdate.section = { connect: { id: parseInt(input.sectionId) } };
    delete dataToUpdate.sectionId;
  }

  // Delegamos la actualización
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