const rolesService = require("../../services/rolesService");

module.exports = {
  Query: {
    // Consultas para Roles
    getAllRoles: async () => {
      return await rolesService.getAllRoles();
    },
    getRoleById: async (_, { id }) => {
      return await rolesService.getRoleById(id);
    },
    getUserRoles: async (_, { userId }) => {
      return await rolesService.getUserRoles(userId);
    },

    // Consultas para Módulos y Acciones
    getAllModules: async () => {
      return await rolesService.getAllModules();
    },
    getAllActions: async () => {
      return await rolesService.getAllActions();
    }
  },

  Mutation: {
    // --- Gestión de Roles ---
    createRole: async (_, { input }) => {
      return await rolesService.createRole(input);
    },
    updateRole: async (_, { id, input }) => {
      return await rolesService.updateRole(id, input);
    },
    deleteRole: async (_, { id }) => {
      return await rolesService.deleteRole(id);
    },

    // --- Asignación de Usuarios a Roles ---
    assignRoleToUser: async (_, { userId, roleId }) => {
      return await rolesService.assignRoleToUser(userId, roleId);
    },
    removeRoleFromUser: async (_, { userId, roleId }) => {
      return await rolesService.removeRoleFromUser(userId, roleId);
    },

    // --- Gestión de Permisos dentro de un Rol ---
    addPermissionToRole: async (_, { input }) => {
      return await rolesService.addPermissionToRole(input);
    },
    removePermissionFromRole: async (_, { permissionId }) => {
      return await rolesService.removePermissionFromRole(permissionId);
    }
  }
};