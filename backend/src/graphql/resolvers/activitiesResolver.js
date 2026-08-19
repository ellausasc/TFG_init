// Importem tot el servei d'activitats
const activitiesService = require("../../services/activitiesService");
const { getActivityVisibility } = require("../../utils/utils");

// El formateig de dates es queda aqui perque es una necessitat especifica de GraphQL.
// A mes, com que Prisma no te camps escalars "mainImage"/"secondaryImage" a
// Activity (es guarden com a Document amb usage MAIN_IMAGE/SECONDARY_IMAGE),
// aqui es reconstrueixen aquests dos camps plans que espera l'esquema GraphQL.
const formatActivity = (activity) => {
  if (!activity) return null;
  const documents = activity.documents || [];
  const mainImageDoc = documents.find((doc) => doc.usage === 'MAIN_IMAGE');
  const secondaryImageDoc = documents.find((doc) => doc.usage === 'SECONDARY_IMAGE');
  // Adjunts (actes, convocatories...) associats a la Junta/Assemblea,
  // vegeu CU-07/CU-12. L'accés ja queda controlat a nivell d'activitat
  // sencera (canViewActivities), aixi que si l'usuari ha pogut arribar a
  // llegir l'activitat, tambe pot veure la seva llista d'adjunts.
  const attachmentDocs = documents.filter((doc) => doc.usage === 'ATTACHMENT');

  // Camps calculats d'ocupacio (RF-2.2 / RF-3.3). Es deriven de la relacio
  // `participants` i del camp `capacity`, i permeten que el frontend mostri
  // les places disponibles i desactivi el boto d'inscripcio sense haver de
  // recuperar la llista completa de participants.
  const participants = activity.participants || [];
  const enrolledCount = participants.length;
  const hasCapacity = activity.capacity !== null && activity.capacity !== undefined;

  return {
    ...activity,
    enrolledCount,
    availableSpots: hasCapacity ? Math.max(activity.capacity - enrolledCount, 0) : null,
    isFull: activitiesService.isFull(activity),
    isEnrollmentOpen: activitiesService.isEnrollmentOpen(activity),
    createdAt: activity.createdAt ? activity.createdAt.toISOString() : null,
    publishedAt: activity.publishedAt ? activity.publishedAt.toISOString() : null,
    activityDate: activity.activityDate ? activity.activityDate.toISOString() : null,
    registrationStartDate: activity.registrationStartDate ? activity.registrationStartDate.toISOString() : null,
    registrationEndDate: activity.registrationEndDate ? activity.registrationEndDate.toISOString() : null,
    mainImage: mainImageDoc ? mainImageDoc.url : null,
    secondaryImage: secondaryImageDoc ? secondaryImageDoc.url : null,
    documents: attachmentDocs.map((doc) => ({
      ...doc,
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
    })),
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

    getActivityById: async (_, { id }, context) => {
      const activity = await activitiesService.getById(id, getActivityVisibility(context));
      return formatActivity(activity);
    },

    getFilteredActivities: async (_, { filter, sort, page, limit }, context) => {
      const filteredActivities = await activitiesService.getFiltered({ filter, sort, page, limit }, getActivityVisibility(context));
      return {
        items: filteredActivities.items.map(formatActivity),
        totalCount: filteredActivities.totalCount,
      };
    },

    getMyActivities: async (_, __, context) => {
      const myActivities = await activitiesService.getMyActivities(context.userId);
      return myActivities.map(formatActivity);
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

    // RF-2.2: el soci anul·la la seva propia inscripcio (userId ve del token).
    unenrollFromActivity: async (_, { activityId }, context) => {
      return await activitiesService.unenroll(activityId, context.userId);
    },

    // RF-3.3 / CU-11: gestio de les inscripcions per part d'un administrador.
    // Aqui l'userId arriba com a argument, no del token, perque l'operacio
    // s'aplica sobre un tercer.
    addParticipantToActivity: async (_, { activityId, userId }) => {
      return await activitiesService.addParticipant(activityId, userId);
    },

    removeParticipantFromActivity: async (_, { activityId, userId }) => {
      return await activitiesService.removeParticipant(activityId, userId);
    },
  }
};