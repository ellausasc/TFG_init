const prisma = require("../config/db");

const getAllRoles = async () => {
  return await prisma.role.findMany({
    include: {
      users: true,
      permission: {
        include: { module: true, action: true, section: true }
      }
    }
  });
};

const getRoleById = async (id) => {
  return await prisma.role.findUnique({
    where: { id: parseInt(id) },
    include: {
      users: true,
      permission: {
        include: { module: true, action: true, section: true }
      }
    }
  });
};

const getUserRoles = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      roles: {
        include: {
          permission: {
            include: { module: true, action: true, section: true }
          }
        }
      }
    }
  });
  
  if (!user) throw new Error("Usuari no trobat");
  return user.roles;
};

const getAllModules = async () => {
  return await prisma.module.findMany();
};

const getAllActions = async () => {
  return await prisma.action.findMany();
};

// ==========================================
// MUTACIONES (Gestión de Roles)
// ==========================================

const createRole = async (input) => {
  return await prisma.role.create({
    data: { description: input.description },
    include: { users: true, permission: true }
  });
};

const updateRole = async (id, input) => {
  return await prisma.role.update({
    where: { id: parseInt(id) },
    data: { description: input.description },
    include: { users: true, permission: true }
  });
};

const deleteRole = async (id) => {
  await prisma.role.delete({
    where: { id: parseInt(id) }
  });
  return true;
};

// ==========================================
// MUTACIONES (Asignación de Usuarios)
// ==========================================

const assignRoleToUser = async (userId, roleId) => {
  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      roles: { connect: { id: parseInt(roleId) } }
    }
  });
  return true;
};

const removeRoleFromUser = async (userId, roleId) => {
  await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      roles: { disconnect: { id: parseInt(roleId) } }
    }
  });
  return true;
};

// ==========================================
// MUTACIONES (Gestión de Permisos)
// ==========================================

const addPermissionToRole = async (input) => {
  try {
    return await prisma.rolePermission.create({
      data: {
        role: { connect: { id: parseInt(input.roleId) } },
        module: { connect: { id: parseInt(input.moduleId) } },
        action: { connect: { id: parseInt(input.actionId) } },
        section: input.sectionId ? { connect: { id: parseInt(input.sectionId) } } : undefined
      },
      include: {
        role: true,
        module: true,
        action: true,
        section: true
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error("Aquest permís ja està assignat a aquest rol.");
    }
    throw error;
  }
};

const removePermissionFromRole = async (permissionId) => {
  await prisma.rolePermission.delete({
    where: { id: parseInt(permissionId) }
  });
  return true;
};

module.exports = {
  getAllRoles,
  getRoleById,
  getUserRoles,
  getAllModules,
  getAllActions,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  addPermissionToRole,
  removePermissionFromRole
};