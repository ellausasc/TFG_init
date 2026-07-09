const { shield, allow, or } = require('graphql-shield'); 
const { isAuthenticated, can, isOwner } = require('./rules'); 

const permissions = shield({
  Query: {
    getAllActivities: allow,
    getActivityBySlug: allow,
    getFilteredActivities: allow,
    getAllNews: allow,
    getNewsBySlug: allow,
    getNewsFiltered: allow,
    getAllSections: allow,
    getSectionById: allow,
    me: isAuthenticated,
    getAllUsers: can('USERS', '03'),
    getUserById: can('USERS', '03'),
    getAllRoles: can('ROLES', '03'),
    getRoleById: can('ROLES', '03'),
    getUserRoles: can('ROLES', '03'),
    getAllModules: can('ROLES', '03'),
    getAllActions: can('ROLES', '03'),
  },

  Mutation: {
    registerUser: allow,
    loginUser: allow,
    updateUser: or(isOwner, can('USERS', '02')),
    changePassword: isAuthenticated,
    enrollInActivity: isAuthenticated,
    createActivity: can('ACTIVITIES', '01'),
    updateActivity: can('ACTIVITIES', '02'),
    createNews: can('NEWS', '01'),
    updateNews: can('NEWS', '02'),
    createSection: can('SECTIONS', '01'),
    updateSection: can('SECTIONS', '02'),
    createRole: can('ROLES', '01'),
    updateRole: can('ROLES', '02'),
    deleteRole: can('ROLES', '02'),
    assignRoleToUser: can('ROLES', '02'),
    removeRoleFromUser: can('ROLES', '02'),
    addPermissionToRole: can('ROLES', '02'),
    removePermissionFromRole: can('ROLES', '02'),
  }
}, {
  fallbackRule: allow, 
  fallbackError: "Accés denegat pel sistema de permisos.",
  allowExternalErrors: true 
});

// ÚNICO EXPORT DE ESTE ARCHIVO
module.exports = permissions;