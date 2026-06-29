// Importamos el servicio
const sectionService = require("../../services/sectionsServices");

// Función para asegurar que las fechas de Prisma (Date) se conviertan a String para GraphQL
const formatSection = (section) => {
  if (!section) return null;
  return {
    ...section,
    createdAt: section.createdAt ? section.createdAt.toISOString() : null,
    publishedAt: section.publishedAt ? section.publishedAt.toISOString() : null,
  };
};

module.exports = {
  Query: {
    // Obtener TODAS las secciones
    getAllSections: async () => {
      const sections = await sectionService.getAll();
      return sections.map(formatSection);
    },

    // Obtener UNA sección por su ID
    getSectionById: async (_, { id }) => {
      const section = await sectionService.getById(id);
      return formatSection(section);
    }
  },

  Mutation: {
    // CREAR una nueva sección
    createSection: async (_, { input }, context) => {
      const newSection = await sectionService.create(input, context.userId);
      return formatSection(newSection);
    },

    // MODIFICAR una sección existente
    updateSection: async (_, { id, input }, context) => {
      const updatedSection = await sectionService.update(id, input, context.userId);
      return formatSection(updatedSection);
    }
  }
};