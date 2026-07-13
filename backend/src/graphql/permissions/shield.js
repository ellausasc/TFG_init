const { shield, allow, or } = require('graphql-shield'); 
const { isAuthenticated, can, isOwner, canViewSections, canViewActivities, canCreateActivity } = require('./rules'); 

const permissions = shield({
  Query: {
    getAllActivities: can('ACTIVITIES', '03'),
    getActivityBySlug: canViewActivities,
    getFilteredActivities: canViewActivities,
    getAllNews: can('NEWS', '03'), //canViewSections('NEWS'),
    getNewsBySlug: canViewSections('NEWS'),
    getNewsFiltered: canViewSections('NEWS'),
    getAllSections: canViewSections('SECTIONS'),
    getSectionById: canViewSections('SECTIONS'),
    me: isAuthenticated,
    getAllUsers: allow, // can('USERS', '03'),
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
    createActivity: canCreateActivity,
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

// Unica exportacio d'aquest fitxer
module.exports = permissions;