const utils = require("../utils/utils");
const activitiesRepository = require("../repositories/activitiesRepository");

const getAll = async () => await activitiesRepository.findAll();
const getBySlug = async (slug) => await activitiesRepository.findBySlug(slug);
const getById = async (id) => await activitiesRepository.findById(parseInt(id, 10));

const getFiltered = async ({ filter, sort, page, limit }) => {
  const currentPage = page || 1;
  const pageSize = limit || 10;
  const skip = (currentPage - 1) * pageSize;

  const where = {};
  if (filter) {
    if (filter.title) where.title = { contains: filter.title, mode: 'insensitive' };
    if (filter.sectionId) where.sectionId = parseInt(filter.sectionId);
    if (filter.authorId) where.authorId = parseInt(filter.authorId);
    if (filter.status !== undefined && filter.status !== null) {
      where.status = filter.status === 'true' || filter.status === true;
    }
  }

  const orderBy = {};
  if (sort) {
    const field = sort.field === 'author' ? 'authorId' : (sort.field || 'activityDate');
    orderBy[field] = sort.direction === 'ASC' ? 'asc' : 'desc';
  } else {
    orderBy.activityDate = 'desc';
  }

  return await activitiesRepository.findFiltered(where, orderBy, skip, pageSize);
};

const create = async (input, userId) => {
  if (!userId) throw new Error("No estàs autenticat. Has d'iniciar sessió per crear activitats.");

  const generatedSlug = utils.slugify(input.title);
  const existingActivity = await activitiesRepository.findBySlug(generatedSlug);
  if (existingActivity) throw new Error("Ja existeix una activitat amb un títol similar.");

  const dataToCreate = {
    title: input.title,
    shortDescription: input.shortDescription,
    longDescription: input.longDescription,
    status: input.status !== undefined ? input.status : false,
    type: input.type,
    mainImage: input.mainImage || null,
    secondaryImage: input.secondaryImage || null,
    slug: generatedSlug,
    activityDate: new Date(input.activityDate),
    registrationStartDate: input.registrationStartDate ? new Date(input.registrationStartDate) : null,
    registrationEndDate: input.registrationEndDate ? new Date(input.registrationEndDate) : null,
    author: { connect: { id: userId } },
    section: { connect: { id: parseInt(input.sectionId) } }
  };

  return await activitiesRepository.create(dataToCreate);
};

const update = async (id, input) => {
  const numericId = parseInt(id, 10);
  const dataToUpdate = { ...input };

  if (input.title) {
    dataToUpdate.slug = utils.slugify(input.title);
    const existingSlug = await activitiesRepository.findSlugExceptId(dataToUpdate.slug, numericId);
    if (existingSlug) throw new Error("El títol nou genera una URL que ja està sent utilitzada per una altra activitat.");
  } else if (input.slug) {
    dataToUpdate.slug = utils.slugify(input.slug);
  }

  if (input.sectionId) {
    dataToUpdate.section = { connect: { id: parseInt(input.sectionId) } };
    delete dataToUpdate.sectionId;
  }

  if (input.activityDate) dataToUpdate.activityDate = new Date(input.activityDate);
  if (input.registrationStartDate !== undefined) dataToUpdate.registrationStartDate = input.registrationStartDate ? new Date(input.registrationStartDate) : null;
  if (input.registrationEndDate !== undefined) dataToUpdate.registrationEndDate = input.registrationEndDate ? new Date(input.registrationEndDate) : null;

  return await activitiesRepository.update(numericId, dataToUpdate);
};

module.exports = { getAll, getBySlug, getById, getFiltered, create, update };