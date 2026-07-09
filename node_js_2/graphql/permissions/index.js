const { shield, rule, allow } = require('graphql-shield');
const authService = require('../../services/authService');

// Regla bàsica d'autenticació
const isAuthenticated = rule({ cache: 'contextual' })(async (parent, args, ctx) => {
  return ctx.userId !== null;
});

// Regla dinàmica: Comprova si l'usuari té una acció específica o "Todas acciones"
const can = (moduleName, actionDescription) => rule({ cache: 'strict' })(
  async (parent, args, ctx) => {
    if (!ctx.userId) return new Error("Usuari no autenticat");

    // Lazy load de los permisos desde la base de datos
    if (!ctx.permissions) {
      ctx.permissions = await authService.getUserPermissions(ctx.userId);
    }

    // 1. GLOBAL: Super Admin (Tiene acceso a "* - Todas las acciones" globalmente)
    if (ctx.permissions.includes("GLOBAL:* - Todas las acciones")) {
      return true;
    }

    // 2. MÓDULO: El usuario tiene "* - Todas las acciones" para este módulo concreto
    if (ctx.permissions.includes(`${moduleName}:* - Todas las acciones`)) {
      return true;
    }

    // 3. SECCIONES (Dinamismo): Si la mutación/query recibe un sectionId, verificamos si tiene permiso para esa sección
    // Buscamos sectionId tanto en la raíz de los args como dentro del objeto input
    const sectionId = args.input?.sectionId || args.sectionId;
    if (sectionId) {
      // Permiso exacto para la sección y la acción
      const requiredSection = `${moduleName}:${actionDescription}:${sectionId}`;
      // Permiso de "Todas las acciones" dentro de esa sección concreta
      const requiredSectionAll = `${moduleName}:* - Todas las acciones:${sectionId}`;
      
      if (ctx.permissions.includes(requiredSection) || ctx.permissions.includes(requiredSectionAll)) {
        return true;
      }
    }

    // 4. MÓDULO EXACTO: Comprobación específica (a nivel global del módulo, sin importar la sección)
    const required = `${moduleName}:${actionDescription}`;
    if (ctx.permissions.includes(required)) {
      return true;
    }

    return new Error(`Acceso denegado. Te falta el permiso: ${actionDescription} en ${moduleName}`);
  }
);

module.exports = {
  isAuthenticated,
  can
};

