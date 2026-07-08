const utils = require("./utils");
const prisma = require("../db");

const getAll = async () => {
    console.log("Obtenint totes les activitats...");
  return await prisma.activity.findMany({
    orderBy: { activityDate: 'desc' }, // Ordenem per la data de l'activitat per defecte
    include: {
      author: true,
      section: true,
      participants: true
    }
  });
};

const getBySlug = async (slug) => {
  return await prisma.activity.findUnique({
    where: { slug },
    include: {
      author: true,
      section: true,
      participants: true
    }
  });
};

const getById = async (id) => {
  return await prisma.activity.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: true,
      section: true,
      participants: true
    }
  });
};

const getFiltered = async ({ filter, sort, page, limit }) => {
  const currentPage = page || 1;
  const pageSize = limit || 10;
  const skip = (currentPage - 1) * pageSize;

  const where = {};
  
  if (filter) {
    if (filter.title) where.title = { contains: filter.title, mode: 'insensitive' };
    if (filter.sectionId) where.sectionId = parseInt(filter.sectionId);
    if (filter.authorId) where.authorId = parseInt(filter.authorId);
    
    // El model Activity no té camp 'location' a Prisma. Si ho necessites, hauràs d'afegir-ho a schema.prisma.
    // if (filter.location) where.location = { contains: filter.location, mode: 'insensitive' };

    if (filter.status !== undefined && filter.status !== null) {
      // El filtre podria arribar com a String des de GraphQL ("true"/"false") o com a Boolean
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

  const [items, totalCount] = await prisma.$transaction([
    prisma.activity.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: { author: true, section: true, participants: true }
    }),
    prisma.activity.count({ where })
  ]);

  return { items, totalCount };
};

const create = async (input, userId) => {
  if (!userId) {
    throw new Error("No estàs autenticat. Has d'iniciar sessió per crear activitats.");
  }

  const generatedSlug = utils.slugify(input.title);

  console.log("Slug generat per a la nova activitat:", generatedSlug);

  const existingActivity = await prisma.activity.findUnique({
    where: { slug: generatedSlug },
  });


console.log("1. Buscando duplicados... existingActivity es:", existingActivity);

  if (existingActivity) {
    throw new Error("Ja existeix una activitat amb un títol similar.");
  }

  console.log("2. Slug libre, intentando crear en Prisma...");

  return await prisma.activity.create({
    data: {
      title: input.title,
      shortDescription: input.shortDescription,
      longDescription: input.longDescription,
      status: input.status !== undefined ? input.status : false,
      type: input.type,
      mainImage: input.mainImage || null,
      secondaryImage: input.secondaryImage || null,
      slug: generatedSlug,
      
      // Conversió de les dates obligatòries i opcionals
      activityDate: new Date(input.activityDate),
      registrationStartDate: input.registrationStartDate ? new Date(input.registrationStartDate) : null,
      registrationEndDate: input.registrationEndDate ? new Date(input.registrationEndDate) : null,
      
      author: { connect: { id: userId } },
      section: { connect: { id: parseInt(input.sectionId) } }
    },
    include: { author: true, section: true, participants: true }
  });
};

const update = async (id, input) => {
  const numericId = parseInt(id, 10);
  const dataToUpdate = { ...input };

  // 1. Gestió del títol i el slug
  console.log(input.title)
  if (input.title) {
    dataToUpdate.slug = utils.slugify(input.title);

    console.log("Nou slug generat:", dataToUpdate.slug);
    
    const existingSlug = await prisma.activity.findFirst({
      where: {
        slug: dataToUpdate.slug,
        NOT: { id: numericId }, 
      },
    });
    
    if (existingSlug) {
      throw new Error("El títol nou genera una URL que ja està sent utilitzada per una altra activitat.");
    }
  } else if (input.slug) {
    dataToUpdate.slug = utils.slugify(input.slug);
  }

  // 2. Gestió de relacions (Section)
  if (input.sectionId) {
    dataToUpdate.section = { connect: { id: parseInt(input.sectionId) } };
    delete dataToUpdate.sectionId;
  }

  // 3. Parseig de dates si venen a la petició
  if (input.activityDate) dataToUpdate.activityDate = new Date(input.activityDate);
  if (input.registrationStartDate !== undefined) {
    dataToUpdate.registrationStartDate = input.registrationStartDate ? new Date(input.registrationStartDate) : null;
  }
  if (input.registrationEndDate !== undefined) {
    dataToUpdate.registrationEndDate = input.registrationEndDate ? new Date(input.registrationEndDate) : null;
  }

  return await prisma.activity.update({
    where: { id: numericId },
    data: dataToUpdate,
    include: { author: true, section: true, participants: true }
  });
};

// Exportem totes les funcions
module.exports = {
  getAll,
  getBySlug,
  getById,
  getFiltered,
  create,
  update
};