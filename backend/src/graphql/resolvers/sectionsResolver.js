// Importem el servei
const sectionsService = require("../../services/sectionsService");
const { getVisibility } = require("../../utils/utils");

// Funcio per assegurar que les dates de Prisma (Date) es converteixin a String per GraphQL
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
    // Obtenir TOTES les seccions
    getAllSections: async (_, __, context) => {
      const sections = await sectionsService.getAll(getVisibility(context));
      return sections.map(formatSection);
    },

    // Obtenir UNA secció pel seu ID
    getSectionById: async (_, { id }, context) => {
      const section = await sectionsService.getById(id, getVisibility(context));
      return formatSection(section);
    }
  },

  Mutation: {
    // CREAR una nova seccio
    createSection: async (_, { input }, context) => {
      const newSection = await sectionsService.create(input, context.userId);
      return formatSection(newSection);
    },

    // MODIFICAR una seccio existent
    updateSection: async (_, { id, input }, context) => {
      const updatedSection = await sectionsService.update(id, input, context.userId);
      return formatSection(updatedSection);
    }
  }
};