const prisma = require("../db");
const { slugify } = require("./utils"); 

const getAll = async () => {
  return await prisma.section.findMany({
    include: { mainNews: true, news: true, activities: true },
    orderBy: { createdAt: 'desc' }
  });
};

const getById = async (id) => {
  return await prisma.section.findUnique({
    where: { id: parseInt(id) },
    include: { mainNews: true, news: true, activities: true }
  });
};

const create = async (input, userId) => {
  if (!userId) {
    throw new Error("No estàs autenticat. Has d'iniciar sessió.");
  }

  return await prisma.$transaction(async (tx) => {
    
    // PASO 1: Crear la sección base
    const newSection = await tx.section.create({
      data: {
        name: input.name,
        description: input.description,
        isActive: input.isActive !== undefined ? input.isActive : true,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      }
    });

    // Extraemos los datos de la noticia del input anidado
    const newsData = input.mainNews;

    // PASO 2: Generar el slug a partir del título exacto que nos envía el usuario
    const generatedSlug = slugify(`${newsData.title}-${Date.now()}`);

    // PASO 3: Crear la noticia de portada usando TODOS los datos configurados en el frontend
    const defaultNews = await tx.news.create({
      data: {
        title: newsData.title,
        shortDescription: newsData.shortDescription,
        longDescription: newsData.longDescription,
        
        // Si no indican el estado, la hacemos pública por defecto
        status: newsData.status !== undefined ? newsData.status : true, 
        type: newsData.type,
        mainImage: newsData.mainImage || "",
        secondaryImage: newsData.secondaryImage || "",
        
        // Fecha de publicación automática si está activa
        publishedAt: newsData.status !== false ? new Date() : null, 
        slug: generatedSlug, 
        
        // Relaciones 1:N
        author: { connect: { id: userId } },
        section: { connect: { id: newSection.id } },

        // Relación N:M para los tags (si se envían)
        tags: newsData.tagIds && newsData.tagIds.length > 0 
          ? { connect: newsData.tagIds.map(id => ({ id: parseInt(id) })) }
          : undefined
      }
    });

    // PASO 4: Actualizar la sección para asignarle la noticia recién creada como principal
    return await tx.section.update({
      where: { id: newSection.id },
      data: {
        mainNews: { connect: { id: defaultNews.id } }
      },
      include: {
        mainNews: true,
        news: true,
        activities: true
      }
    });
  });
};

const update = async (id, input, userId) => {
  if (!userId) {
    throw new Error("No estàs autenticat. Has d'iniciar sessió.");
  }

  // 1. Separem mainNews de la resta de dades
  const { mainNews, mainNewsId, ...sectionData } = input;
  const dataToUpdate = { ...sectionData };

  // 2. Formateig de dates
  if (dataToUpdate.publishedAt) {
    dataToUpdate.publishedAt = new Date(dataToUpdate.publishedAt);
  }

  console.log("News data received for update:", mainNews);

  // 3. Lògica de mainNews
  // A) Si ens envien un objecte amb dades (actualització de camps)
  if (mainNews) {
    dataToUpdate.mainNews = {
      update: {
        title: mainNews.title,
        shortDescription: mainNews.shortDescription,
        longDescription: mainNews.longDescription,
        status: mainNews.status,
        type: mainNews.type
      }
    };
  } 
  // B) Si només ens envien un ID (connexió)
  else if (mainNewsId) {
    dataToUpdate.mainNews = { connect: { id: parseInt(mainNewsId) } };
  }

  // 4. Execució amb Prisma
  return await prisma.section.update({
    where: { id: parseInt(id) },
    data: dataToUpdate,
    include: { mainNews: true, news: true, activities: true  }
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update
};