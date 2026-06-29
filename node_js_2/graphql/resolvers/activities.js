const prisma = require("../../db");

const formatActivity = (act) => {
  if (!act) return null;
  return {
    ...act,
    // Formateamos las fechas a String (ISO) si existen
    createdAt: act.createdAt ? act.createdAt.toISOString() : null,
    publishedAt: act.publishedAt ? act.publishedAt.toISOString() : null,
    activityDate: act.activityDate ? act.activityDate.toISOString() : null,
    registrationStartDate: act.registrationStartDate ? act.registrationStartDate.toISOString() : null,
    registrationEndDate: act.registrationEndDate ? act.registrationEndDate.toISOString() : null,
  };
};

module.exports = {
  Query: {
    getAllActivities: async () => {
      const activities = await prisma.activity.findMany({
        // IMPORTANTE: Traemos las relaciones para que GraphQL pueda pintarlas
        include: {
          author: true,
          section: true,
          tags: true,
          participants: true
        }
      });
      return activities.map(formatActivity);
    },
    getActivityBySlug: async (_, { slug }) => {
      const activity = await prisma.activity.findUnique({ 
        where: { slug },
        include: {
          author: true,
          section: true,
          tags: true,
          participants: true
        }
      });
      return formatActivity(activity);
    }
  },
  Mutation: {
    // Aquí puedes añadir los createActivity y enrollInActivity usando la misma lógica relacional que las noticias
  }
};