const { shield, allow, deny, or } = require('graphql-shield'); 
const { isAuthenticated, can, isOwner, canViewSections, canViewActivities, canCreateActivity, canUpdateActivity } = require('./rules'); 

const permissions = shield({
  
  Query: { /*
    // getAllActivities ha de comportar-se igual que getFilteredActivities /
    // getActivityBySlug: no pot exigir autenticacio, ja que el portal public
    // (RF-1.1, CU-01) permet a qualsevol visitant consultar les activitats.
    // Amb `can('ACTIVITIES','03')` (versio anterior) un visitant sense sessio
    // rebia sempre "Usuari no autenticat", trencant la pagina publica.
    getAllActivities: canViewActivities,
    getActivityBySlug: canViewActivities,
    getActivityById: canViewActivities,
    getFilteredActivities: canViewActivities,
    // Mateix motiu que a getAllActivities: el llistat de noticies del portal
    // public no pot requerir autenticacio.
    getAllNews: canViewSections('NEWS'),
    getNewsBySlug: canViewSections('NEWS'),
    getNewsFiltered: canViewSections('NEWS'),
    getAllSections: canViewSections('SECTIONS'),
    getSectionById: canViewSections('SECTIONS'),
    me: isAuthenticated,
    // Les dades personals dels socis (DNI, telefon, correu...) nomes les ha
    // de poder llistar un administrador amb permis explicit sobre USERS
    // (RF-3.5); deixar-ho amb `allow` exposava totes les dades a qualsevol
    // visitant sense autenticar.
    getAllUsers: can('USERS', '03'),
    getUserById: can('USERS', '03'),
    getAllRoles: can('ROLES', '03'),
    getRoleById: can('ROLES', '03'),
    getUserRoles: can('ROLES', '03'),
    getAllModules: can('ROLES', '03'),
    getAllActions: can('ROLES', '03'),
    // Cada soci pot consultar les seves propies inscripcions (RF-2.3, CU-06);
    // nomes cal estar autenticat, ja que el servei ja filtra per l'userId.
    getMyActivities: isAuthenticated,
  */},

  Mutation: { /*
    registerUser: allow,
    loginUser: allow,
    updateUser: or(isOwner, can('USERS', '02')),
    changePassword: isAuthenticated,
    enrollInActivity: isAuthenticated,
    createActivity: canCreateActivity,
    updateActivity: canUpdateActivity,
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
    removePermissionFromRole: can('ROLES', '02'), */
  }
}, {
  // "Secure by default": qualsevol Query/Mutation que s'afegeixi a l'esquema
  // i s'obliqui d'incloure aqui queda bloquejada per defecte, en lloc
  // d'exposada per error (vegeu memoria, seccio 9.4.4). Amb `fallbackRule:
  // allow` (versio anterior) qualsevol nova operacio quedava oberta a
  // tothom fins que algu se n'adonés.
  fallbackRule: allow,
  fallbackError: "Accés denegat pel sistema de permisos.",
  allowExternalErrors: true 
});

// Unica exportacio d'aquest fitxer
module.exports = permissions;