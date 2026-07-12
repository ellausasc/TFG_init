const rolesRepository = require("../repositories/rolesRepository");
const usersRepository = require("../repositories/usersRepository"); // Reutilizamos el repo de usuarios!

const getAllRoles = async () => await rolesRepository.findAllRoles();
const getRoleById = async (id) => await rolesRepository.findRoleById(parseInt(id, 10));

const getUserRoles = async (userId) => {
  const user = await usersRepository.findById(parseInt(userId, 10));
  if (!user) throw new Error("Usuari no trobat");
  return user.roles;
};

const getAllModules = async () => await rolesRepository.findAllModules();
const getAllActions = async () => await rolesRepository.findAllActions();

const createRole = async (input) => await rolesRepository.createRole({ description: input.description });
const updateRole = async (id, input) => await rolesRepository.updateRole(parseInt(id, 10), { description: input.description });
const deleteRole = async (id) => {
  await rolesRepository.deleteRole(parseInt(id, 10));
  return true;
};

const assignRoleToUser = async (userId, roleId) => {
  await rolesRepository.assignRoleToUser(parseInt(userId, 10), parseInt(roleId, 10));
  return true;
};

const removeRoleFromUser = async (userId, roleId) => {
  await rolesRepository.removeRoleFromUser(parseInt(userId, 10), parseInt(roleId, 10));
  return true;
};

const addPermissionToRole = async (input) => {
  try {
    const dataToCreate = {
      role: { connect: { id: parseInt(input.roleId, 10) } },
      module: { connect: { id: parseInt(input.moduleId, 10) } },
      action: { connect: { id: parseInt(input.actionId, 10) } },
      section: input.sectionId ? { connect: { id: parseInt(input.sectionId, 10) } } : undefined
    };
    return await rolesRepository.addPermissionToRole(dataToCreate);
  } catch (error) {
    if (error.code === 'P2002') throw new Error("Aquest permís ja està assignat a aquest rol.");
    throw error;
  }
};

const removePermissionFromRole = async (permissionId) => {
  await rolesRepository.removePermissionFromRole(parseInt(permissionId, 10));
  return true;
};

module.exports = {
  getAllRoles, getRoleById, getUserRoles, getAllModules, getAllActions,
  createRole, updateRole, deleteRole, assignRoleToUser, removeRoleFromUser,
  addPermissionToRole, removePermissionFromRole
};