const { rule } = require('graphql-shield');
const usersService = require("../../services/usersService");

const isAuthenticated = rule({ cache: 'contextual' })(async (parent, args, ctx) => {
  return ctx.userId !== null && ctx.userId !== undefined;
});

const can = (moduleName, actionCode) => rule({ cache: 'strict' })(
  async (parent, args, ctx) => {
    if (!ctx.userId) return new Error("Usuari no autenticat");

    if (!ctx.permissions) {
      ctx.permissions = await usersService.getUserPermissions(ctx.userId);
    }

    const hasPerm = (requiredPerm) => {
      return ctx.permissions.some(userPerm => userPerm.trim() === requiredPerm.trim());
    };

    if (hasPerm(`${moduleName}:*`)) return true;

    const sectionId = args.input?.sectionId || args.sectionId;
    if (sectionId) {
      if (hasPerm(`${moduleName}:${actionCode}:${sectionId}`)) return true;
      if (hasPerm(`${moduleName}:*:${sectionId}`)) return true;
    }

    if (hasPerm(`${moduleName}:${actionCode}`)) return true;

    return new Error(`Accés denegat. Et falta el permís: ${actionCode} a ${moduleName}`);
  }
);

const isOwner = rule({ cache: 'strict' })(async (parent, args, ctx) => {
  if (!ctx.userId) return false;
  if (!args.id) return true; 
  return args.id.toString() === ctx.userId.toString();
});

module.exports = {
  isAuthenticated,
  can,
  isOwner
};