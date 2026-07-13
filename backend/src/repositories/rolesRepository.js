const prisma = require("../config/db");

const findAllRoles = async () => {
  return await prisma.role.findMany({
    include: { users: true, permission: { include: { module: true, action: true, section: true } } }
  });
};

const findRoleById = async (id) => {
  return await prisma.role.findUnique({
    where: { id },
    include: { users: true, permission: { include: { module: true, action: true, section: true } } }
  });
};

const findAllModules = async () => await prisma.module.findMany();
const findAllActions = async () => await prisma.action.findMany();

const createRole = async (data) => {
  return await prisma.role.create({ data, include: { users: true, permission: true } });
};

const updateRole = async (id, data) => {
  return await prisma.role.update({ where: { id }, data, include: { users: true, permission: true } });
};

const deleteRole = async (id) => await prisma.role.delete({ where: { id } });

const assignRoleToUser = async (userId, roleId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { roles: { connect: { id: roleId } } }
  });
};

const removeRoleFromUser = async (userId, roleId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { roles: { disconnect: { id: roleId } } }
  });
};

const addPermissionToRole = async (data) => {
  return await prisma.rolePermission.create({
    data,
    include: { role: true, module: true, action: true, section: true }
  });
};

const removePermissionFromRole = async (id) => {
  return await prisma.rolePermission.delete({ where: { id } });
};

module.exports = {
  findAllRoles, findRoleById, findAllModules, findAllActions,
  createRole, updateRole, deleteRole, assignRoleToUser, removeRoleFromUser,
  addPermissionToRole, removePermissionFromRole
};