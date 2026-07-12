const rolesService = require("../../services/rolesService");

module.exports = {
  Query: {
    // Consultes per a Rols
    getAllRoles: async () => {
      return await rolesService.getAllRoles();
    },
    getRoleById: async (_, { id }) => {
      return await rolesService.getRoleById(id);
    },
    getUserRoles: async (_, { userId }) => {
      return await rolesService.getUserRoles(userId);
    },

    // Consultes per a Moduls i Accions
    getAllModules: async () => {
      return await rolesService.getAllModules();
    },
    getAllActions: async () => {
      return await rolesService.getAllActions();
    }
  },

  Mutation: {
    // --- Gestio de Rols ---
    createRole: async (_, { input }) => {
      return await rolesService.createRole(input);
    },
    updateRole: async (_, { id, input }) => {
      return await rolesService.updateRole(id, input);
    },
    deleteRole: async (_, { id }) => {
      return await rolesService.deleteRole(id);
    },

    // --- Assignacio d'Usuaris a Rols ---
    assignRoleToUser: async (_, { userId, roleId }) => {
      return await rolesService.assignRoleToUser(userId, roleId);
    },
    removeRoleFromUser: async (_, { userId, roleId }) => {
      return await rolesService.removeRoleFromUser(userId, roleId);
    },

    // --- Gestio de Permisos dins d'un Rol ---
    addPermissionToRole: async (_, { input }) => {
      return await rolesService.addPermissionToRole(input);
    },
    removePermissionFromRole: async (_, { permissionId }) => {
      return await rolesService.removePermissionFromRole(permissionId);
    }
  }
};