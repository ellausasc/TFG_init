const prisma = require("../config/db");

const findAll = async () => {
  return await prisma.user.findMany({ include: { roles: true } });
};

const findById = async (id) => {
  return await prisma.user.findUnique({ 
    where: { id },
    include: { roles: true }
  });
};

const findByEmailOrDni = async (email, dni) => {
  return await prisma.user.findFirst({
    where: { OR: [{ email: email }, { dni: dni }] },
  });
};

const findByEmailOrDniExceptId = async (email, dni, idToExclude) => {
  return await prisma.user.findFirst({
    where: {
      OR: [ email ? { email: email } : {}, dni ? { dni: dni } : {} ],
      NOT: { id: idToExclude }
    },
  });
};

const findByEmailWithPermissions = async (email) => {
  return await prisma.user.findUnique({ 
    where: { email },
    include: { 
      roles: {
        include: { 
          permission: { include: { module: true, action: true, section: true } } 
        }
      }
    } 
  });
};

const findByEmailWithPermissions = async (email) => {
  return await prisma.user.findUnique({ 
    where: { email },
    include: { 
      roles: {
        include: { 
          permission: { include: { module: true, action: true, section: true } } 
        }
      }
    } 
  });
};

const findByIdWithPermissions = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          permission: { include: { module: true, action: true, section: true } }
        }
      }
    }
  });
};

const create = async (data) => {
  return await prisma.user.create({ data, include: { roles: true } });
};

const update = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
    include: { roles: true }
  });
};

module.exports = { findAll, findById, findByEmailOrDni, findByEmailOrDniExceptId, findByEmailWithPermissions, create, update };