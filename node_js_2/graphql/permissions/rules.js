const { shield, allow } = require('graphql-shield');
const { isAuthenticated, can } = require('./index');

const permissions = shield({
  Query: {
    // --- Consultas Públicas / Abiertas ---
    getAllActivities: allow, 
    getAllModules: allow, // Normalmente los módulos y acciones son públicos para pintar formularios
    getAllActions: allow,
    
    // --- MÓDULO: ROLES (Requieren visualización) ---
    getAllRoles: can('ROLES', '03 - Visualizacion'),
    getRoleById: can('ROLES', '03 - Visualizacion'),
    getUserRoles: can('ROLES', '03 - Visualizacion'),
  },
  Mutation: {
    // ==========================================
    // MÓDULO: ACTIVIDADES
    // ==========================================
    createActivity: can('ACTIVIDADES', '01 - Creacion'),
    
    // ==========================================
    // MÓDULO: NOTICIAS
    // ==========================================
    createNews: can('NOTICIAS', '01 - Creacion'),
    
    // ==========================================
    // MÓDULO: ROLES
    // ==========================================
    createRole: can('ROLES', '01 - Creacion'),
    
    // Como no definiste "04 - Eliminacion", asumimos que borrar o editar es "Modificacion"
    updateRole: can('ROLES', '02 - Modificacion'),
    deleteRole: can('ROLES', '02 - Modificacion'), 
    
    assignRoleToUser: can('ROLES', '02 - Modificacion'),
    removeRoleFromUser: can('ROLES', '02 - Modificacion'),
    
    addPermissionToRole: can('ROLES', '02 - Modificacion'),
    removePermissionFromRole: can('ROLES', '02 - Modificacion'),

    // Aquí irías agregando las mutaciones de USUARIOS, JUNTAS y SECCIONES a medida que las crees
    // Ejemplo:
    // createJunta: can('JUNTAS', '01 - Creacion')
  }
}, {
  fallbackError: "Acceso denegado por el sistema de permisos",
  allowExternalErrors: true // Permite que el frontend lea el mensaje de Error("Acceso denegado...") exacto
});

module.exports = permissions;