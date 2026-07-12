const prisma = require("../config/db");

const findAll = async () => {
  return await prisma.activity.findMany({
    orderBy: { activityDate: 'desc' },
    include: { author: true, section: true, participants: true }
  });
};

const findBySlug = async (slug) => {
  return await prisma.activity.findUnique({
    where: { slug },
    include: { author: true, section: true, participants: true }
  });
};

const findById = async (id) => {
  return await prisma.activity.findUnique({
    where: { id },
    include: { author: true, section: true, participants: true }
  });
};

const findFiltered = async (where, orderBy, skip, take) => {
  const [items, totalCount] = await prisma.$transaction([
    prisma.activity.findMany({
      where, orderBy, skip, take,
      include: { author: true, section: true, participants: true }
    }),
    prisma.activity.count({ where })
  ]);
  return { items, totalCount };
};

const findSlugExceptId = async (slug, idToExclude) => {
  return await prisma.activity.findFirst({
    where: {
      slug: slug,
      NOT: idToExclude ? { id: idToExclude } : undefined,
    },
  });
};

const create = async (data) => {
  return await prisma.activity.create({
    data,
    include: { author: true, section: true, participants: true }
  });
};

const update = async (id, data) => {
  return await prisma.activity.update({
    where: { id },
    data,
    include: { author: true, section: true, participants: true }
  });
};

const enroll = async (activityId, userId) => {
  return await prisma.activity.update({
    where: { id: activityId },
    data: { participants: { connect: { id: userId } } },
    include: { author: true, section: true, participants: true }
  });
};

module.exports = { findAll, findBySlug, findById, findFiltered, findSlugExceptId, create, update, enroll };
