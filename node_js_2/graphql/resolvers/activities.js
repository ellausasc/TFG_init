const prisma = require("../../db");

const formatActivity = (act) => {
  if (!act) return null;
  return {
    ...act,
    image: { src: act.image_src, alt: act.image_alt },
    creation_date: act.creation_date.toISOString(),
    publication_date: act.publication_date.toISOString(),
    activity_date: act.activity_date.toISOString(),
    begin_inscription_date: act.begin_inscription_date.toISOString(),
    end_inscription_date: act.end_inscription_date.toISOString(),
  };
};

module.exports = {
  Query: {
    getAllActivities: async () => {
      const activities = await prisma.activity.findMany();
      return activities.map(formatActivity);
    },
    getActivityBySlug: async (_, { slug }) => {
      const activity = await prisma.activity.findUnique({ where: { slug } });
      return formatActivity(activity);
    }
  }
};