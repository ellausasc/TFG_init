// Importem tot el servei d'activitats
const activitiesService = require("../../services/activitiesService");
const { getActivityVisibility } = require("../../utils/utils");

// El formateig de dates es queda aqui perque es una necessitat especifica de GraphQL.
// A mes, com que Prisma no te camps escalars "mainImage"/"secondaryImage" a
// Activity (es guarden com a Documents amb role MAIN_IMAGE/SECONDARY_IMAGE),
// aqui es reconstrueixen aquests dos camps plans que espera l'esquema GraphQL.
const formatActivity = (activity) => {
  if (!activity) return null;
  const documents = activity.documents || [];
  const mainImageDoc = documents.find((doc) => doc.role === 'MAIN_IMAGE');
  const secondaryImageDoc = documents.find((doc) => doc.role === 'SECONDARY_IMAGE');

  return {
    ...activity,
    createdAt: activity.createdAt ? activity.createdAt.toISOString() : null,
    publishedAt: activity.publishedAt ? activity.publishedAt.toISOString() : null,
    activityDate: activity.activityDate ? activity.activityDate.toISOString() : null,
    registrationStartDate: activity.registrationStartDate ? activity.registrationStartDate.toISOString() : null,
    registrationEndDate: activity.registrationEndDate ? activity.registrationEndDate.toISOString() : null,
    mainImage: mainImageDoc ? mainImageDoc.url : null,
    secondaryImage: secondaryImageDoc ? secondaryImageDoc.url : null,
  };
};

module.exports = {
  Query: {
    getAllActivities: async (_, __, context) => {
      const allActivities = await activitiesService.getAll(getActivityVisibility(context));
      return allActivities.map(formatActivity);
    },

    getActivityBySlug: async (_, { slug }, context) => {
      const activity = await activitiesService.getBySlug(slug, getActivityVisibility(context));
      return formatActivity(activity);
    },

    getFilteredActivities: async (_, { filter, sort, page, limit }, context) => {
      const filteredActivities = await activitiesService.getFiltered({ filter, sort, page, limit }, getActivityVisibility(context));
      return {
        items: filteredActivities.items.map(formatActivity),
        totalCount: filteredActivities.totalCount,
      };
    },
  },

  Mutation: {
    createActivity: async (_, { input }, context) => {
      // Passem l'input i l'userId (del context) al servei
      try {
        const newActivity = await activitiesService.create(input, context.userId);
        return formatActivity(newActivity);
      } catch (error) {
        throw new Error("Error al crear l'activitat: " + error.message);
      }
    },

    updateActivity: async (_, { id, input }) => {
      // Passem l'id i l'input al servei
      const updatedActivity = await activitiesService.update(id, input);
      return formatActivity(updatedActivity);
    },

    enrollInActivity: async (_, { activityId }, context) => {
      // Passem l'activityId i l'userId (del context) al servei
      return await activitiesService.enroll(activityId, context.userId);
    },
  }
};