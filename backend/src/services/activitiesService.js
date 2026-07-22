const utils = require("../utils/utils");
const activitiesRepository = require("../repositories/activitiesRepository");

// Condicio "publica" comuna, sense el tipus: publicada i no marcada com a privada
const PUBLIC_CONDITION_BASE = { status: 'PUBLISHED', isPrivate: false };

// Els tipus GENERAL i TALLER depenen del modul ACTIVITIES; ASSEMBLEA i JUNTA
// depenen del modul ASSEMBLY (igual que a `canCreateActivity`, a rules.js).
// Per aixo la visibilitat de lectura no es un unic domini, sino dos, que cal
// combinar amb un OR tenint en compte a quin tipus pertany cada activitat.
//
// `allowPublicFallback` nomes te sentit per a GENERAL/TALLER: existeix una
// pagina publica (/activities) pensada perque qualsevol visitant (fins i tot
// sense cap permis) hi vegi les activitats publicades. Les Juntes/Assemblees
// no tenen cap pagina publica equivalent, per aixo per a ASSEMBLY es
// desactiva aquest "fallback": sense permis (total o de seccio) sobre
// ASSEMBLY, l'usuari no veu cap Junta ni Assemblea, independentment de si
// son "publiques".
const buildTypeVisibilityCondition = (types, domainVisibility, allowPublicFallback = true) => {
  const typeCondition = types.length === 1 ? { type: types[0] } : { type: { in: types } };

  if (!domainVisibility || !domainVisibility.restrictedToPublic) {
    // Permis total del modul corresponent: cap restriccio per a aquest tipus
    return typeCondition;
  }

  const sectionIds = (domainVisibility.visibleSectionIds || [])
    .map((id) => parseInt(id, 10))
    .filter((id) => !Number.isNaN(id));

  const publicCondition = allowPublicFallback ? { ...typeCondition, ...PUBLIC_CONDITION_BASE } : null;

  if (sectionIds.length > 0) {
    const sectionCondition = { ...typeCondition, sectionId: { in: sectionIds } };
    return publicCondition ? { OR: [publicCondition, sectionCondition] } : sectionCondition;
  }

  // Sense permis total ni de seccio: si el domini no admet fallback public
  // (ASSEMBLY), no es mostra res d'aquest tipus.
  return publicCondition || { id: -1 };
};

// Combina la visibilitat dels dos dominis (GENERAL/TALLER i ASSEMBLEA/JUNTA)
// en un unic filtre "where" i el combina amb els filtres propis de la
// consulta (titol, seccio, etc.) mitjancant un AND.
const applyActivityVisibilityFilter = (where, activityVisibility) => {
  const visibilityFilter = {
    OR: [
      buildTypeVisibilityCondition(['GENERAL', 'TALLER'], activityVisibility.GENERAL, true),
      buildTypeVisibilityCondition(['ASSEMBLEA', 'JUNTA'], activityVisibility.ASSEMBLY, false),
    ],
  };

  return { AND: [where, visibilityFilter] };
};

// L'Activity de Prisma no te camps escalars "mainImage"/"secondaryImage": les
// imatges es guarden com a registres de la relacio `documents`, diferenciats
// pel seu `usage` (MAIN_IMAGE / SECONDARY_IMAGE). Aquesta funcio construeix
// la llista de documents a crear a partir de l'input rebut de GraphQL.
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

const getAll = async (activityVisibility) => {
  const where = applyActivityVisibilityFilter({}, activityVisibility);
  return await activitiesRepository.findAll(where);
};

const getBySlug = async (slug, activityVisibility) => {
  const where = applyActivityVisibilityFilter({}, activityVisibility);
  return await activitiesRepository.findBySlug(slug, where);
};

const getById = async (id, activityVisibility) => {
  const where = applyActivityVisibilityFilter({}, activityVisibility);
  return await activitiesRepository.findById(parseInt(id, 10), where);
};

const getFiltered = async ({ filter, sort, page, limit }, activityVisibility) => {
  const currentPage = page || 1;
  const pageSize = limit || 10;
  const skip = (currentPage - 1) * pageSize;

  let where = {};
  if (filter) {
    if (filter.title) where.title = { contains: filter.title, mode: 'insensitive' };
    if (filter.sectionId) where.sectionId = parseInt(filter.sectionId);
    if (filter.authorId) where.authorId = parseInt(filter.authorId);
    if (filter.type) where.type = filter.type;
    if (filter.types && filter.types.length > 0) where.type = { in: filter.types };
    // `status` es un String ('DRAFT' | 'PUBLISHED', igual que a News), ja no
    // cal cap conversio a booleana.
    if (filter.status !== undefined && filter.status !== null) {
      where.status = filter.status;
    }
  }
  where = applyActivityVisibilityFilter(where, activityVisibility);

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
    status: input.status !== undefined ? input.status : 'DRAFT',
    type: input.type,
    capacity: input.capacity !== undefined ? input.capacity : null,
    // Les Juntes i Assemblees son contingut intern per defecte; les activitats
    // GENERAL/TALLER son publiques per defecte. Si l'input especifica isPrivate
    // explicitament, es respecta igualment (permet fer una Junta publica).
    isPrivate: input.isPrivate !== undefined ? input.isPrivate : !['GENERAL', 'TALLER'].includes(input.type),
    slug: generatedSlug,
    activityDate: new Date(input.activityDate),
    registrationStartDate: input.registrationStartDate ? new Date(input.registrationStartDate) : null,
    registrationEndDate: input.registrationEndDate ? new Date(input.registrationEndDate) : null,
    author: { connect: { id: userId } },
    section: { connect: { id: parseInt(input.sectionId) } },
    documents: { create: buildImageDocuments(input) }
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

  // mainImage/secondaryImage no son camps escalars a Prisma: si venen a
  // l'input, substituim el document existent d'aquell usage (si n'hi ha) pel nou
  const usagesToReplace = [];
  if (input.mainImage !== undefined) usagesToReplace.push('MAIN_IMAGE');
  if (input.secondaryImage !== undefined) usagesToReplace.push('SECONDARY_IMAGE');

  if (usagesToReplace.length > 0) {
    dataToUpdate.documents = {
      deleteMany: { usage: { in: usagesToReplace } },
      create: buildImageDocuments(input)
    };
  }
  delete dataToUpdate.mainImage;
  delete dataToUpdate.secondaryImage;

  return await activitiesRepository.update(numericId, dataToUpdate);
};

const enroll = async (activityId, userId) => {
  if (!userId) throw new Error("No estàs autenticat. Has d'iniciar sessió per inscriure't a una activitat.");

  const numericActivityId = parseInt(activityId, 10);
  const activity = await activitiesRepository.findById(numericActivityId);
  if (!activity) throw new Error("L'activitat no existeix.");

  const alreadyEnrolled = activity.participants.some((participant) => participant.id === userId);
  if (alreadyEnrolled) throw new Error("Ja estàs inscrit en aquesta activitat.");

  if (activity.registrationEndDate && new Date() > new Date(activity.registrationEndDate)) {
    throw new Error("El termini d'inscripció d'aquesta activitat ja ha finalitzat.");
  }

  await activitiesRepository.enroll(numericActivityId, userId);
  return true;
};

module.exports = { getAll, getBySlug, getById, getFiltered, create, update, enroll };