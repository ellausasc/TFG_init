// Importem tot el servei d'activitats
const activitiesService = require("../../services/activitiesService");

// El formateig de dates es queda aqui perque es una necessitat especifica de GraphQL
const formatActivity = (activity) => {
  if (!activity) return null;
  return {
    ...activity,
    createdAt: activity.createdAt ? activity.createdAt.toISOString() : null,
    publishedAt: activity.publishedAt ? activity.publishedAt.toISOString() : null,
    activityDate: activity.activityDate ? activity.activityDate.toISOString() : null,
    registrationStartDate: activity.registrationStartDate ? activity.registrationStartDate.toISOString() : null,
    registrationEndDate: activity.registrationEndDate ? activity.registrationEndDate.toISOString() : null,
  };
};

module.exports = {
  Query: {
    getAllActivities: async () => {
      const allActivities = await activitiesService.getAll();
      return allActivities.map(formatActivity);
    },

    getActivityBySlug: async (_, { slug }) => {
      const activity = await activitiesService.getBySlug(slug);
      return formatActivity(activity);
    },

    getFilteredActivities: async (_, { filter, sort, page, limit }) => {
      const filteredActivities = await activitiesService.getFiltered({ filter, sort, page, limit });
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
