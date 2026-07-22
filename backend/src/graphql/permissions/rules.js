const { rule } = require('graphql-shield');
const usersService = require("../../services/usersService");

const isAuthenticated = rule({ cache: 'contextual' })(async (parent, args, ctx) => {
  return ctx.userId !== null && ctx.userId !== undefined;
});

// Logica compartida de comprovacio de permisos (modul, accio i, opcionalment,
// seccio), reutilitzada tant per `can` com per `canCreateActivity`.
const hasModulePermission = async (ctx, moduleName, actionCode, sectionId) => {
  if (!ctx.permissions) {
    ctx.permissions = await usersService.getUserPermissions(ctx.userId);
  }

  console.log(`Permisos de l'usuari ${ctx.userId}:`, ctx.permissions);

  const hasPerm = (requiredPerm) => {
    return ctx.permissions.some(userPerm => userPerm.trim() === requiredPerm.trim());
  };

  if (hasPerm(`${moduleName}:*`)) return true;

  if (sectionId) {
    if (hasPerm(`${moduleName}:${actionCode}:${sectionId}`)) return true;
    if (hasPerm(`${moduleName}:*:${sectionId}`)) return true;
  }

  return hasPerm(`${moduleName}:${actionCode}`);
};

const can = (moduleName, actionCode) => rule({ cache: 'strict' })(
  async (parent, args, ctx) => {
    if (!ctx.userId) return new Error("Usuari no autenticat");

    const sectionId = args.input?.sectionId || args.sectionId;
    const allowed = await hasModulePermission(ctx, moduleName, actionCode, sectionId);

    console.log(`Comprovant permís per a ${moduleName}:${actionCode}${sectionId ? `:${sectionId}` : ''} => ${allowed ? 'PERMET' : 'DENEGAT'}`);

    return allowed || new Error(`Accés denegat. Et falta el permís: ${actionCode} a ${moduleName}`);
  }
);

const isOwner = rule({ cache: 'strict' })(async (parent, args, ctx) => {
  if (!ctx.userId) return false;
  if (!args.id) return true; 
  return args.id.toString() === ctx.userId.toString();
});

// El modul ACTIVITIES permet crear activitats de tipus GENERAL i TALLER; el
// modul ASSEMBLY es el que permet crear els altres dos tipus (ASSEMBLEA i
// JUNTA). Aquesta regla mira el `type` que ve a l'input i decideix, en temps
// d'execucio, quin dels dos moduls cal comprovar.
const ACTIVITY_TYPE_MODULES = {
  GENERAL: 'ACTIVITIES',
  TALLER: 'ACTIVITIES',
  ASSEMBLEA: 'ASSEMBLY',
  JUNTA: 'ASSEMBLY',
};

const canCreateActivity = rule({ cache: 'strict' })(
  async (parent, args, ctx) => {
    if (!ctx.userId) return new Error("Usuari no autenticat");

    const requestedType = args.input?.type || 'GENERAL';
    const requiredModule = ACTIVITY_TYPE_MODULES[requestedType];
    if (!requiredModule) return new Error(`Tipus d'activitat desconegut: ${requestedType}`);

    const sectionId = args.input?.sectionId;
    const allowed = await hasModulePermission(ctx, requiredModule, '01', sectionId);

    return allowed || new Error(`Accés denegat. Et falta el permís de creació a ${requiredModule} per crear una activitat de tipus ${requestedType}.`);
  }
);

// Aquesta regla mai bloqueja la consulta: sempre retorna true. La seva feina
// es calcular, per a l'usuari actual, si ha de veure NOMES el contingut
// public (ctx.restrictedToPublic = true) o si te permis total del modul i,
// per tant, no cal restringir res. Quan esta restringit, tambe calcula a
// quines seccions concretes te permis de lectura explicit (ctx.visibleSectionIds),
// perque el service pugui afegir-hi un filtre "OR" en lloc de denegar la
// consulta sencera.
const canViewSections = (moduleName) => rule({ cache: 'strict' })(
  async (parent, args, ctx) => {
    if (ctx.userId) {
      if (!ctx.permissions) {
        ctx.permissions = await usersService.getUserPermissions(ctx.userId);
      }
    } else {
      ctx.permissions = ctx.permissions || [];
    }

    const hasPerm = (requiredPerm) => {
      return ctx.permissions.some(userPerm => userPerm.trim() === requiredPerm.trim());
    };

    console.log(`Permisos de l'usuari ${ctx.userId}:`, ctx.permissions);

    if (hasPerm(`${moduleName}:*`)) {
      ctx.restrictedToPublic = false;
      console.log(`Usuari ${ctx.userId} te permisos totals per al modul ${moduleName}.`);
      return true;
    }

    // Extraiem les seccions on l'usuari te un permis de lectura explicit
    // (p.ex. "ACTIVITIES:03:5" o "ACTIVITIES:*:5")
    const prefix = `${moduleName}:`;
    ctx.visibleSectionIds = ctx.permissions
      .filter((perm) => perm.startsWith(prefix) && perm.split(':').length === 3)
      .map((perm) => perm.split(':')[2]);

    ctx.restrictedToPublic = true;
    console.log(`Usuari ${ctx.userId} te permisos restringits per al modul ${moduleName}. Seccions visibles:`, ctx.visibleSectionIds);
    return true;
  }
);

// Calcula, per a un modul concret, si l'usuari te acces total (restrictedToPublic:
// false) o si nomes pot veure el contingut public i el de les seves seccions
// (restrictedToPublic: true + visibleSectionIds). Es la mateixa logica que
// `canViewSections`, extreta perque `canViewActivities` l'ha d'aplicar dues
// vegades (un cop per ACTIVITIES i un altre per ASSEMBLY).
const computeDomainVisibility = (ctx, moduleName) => {
  const hasPerm = (requiredPerm) => {
    return ctx.permissions.some(userPerm => userPerm.trim() === requiredPerm.trim());
  };

  if (hasPerm(`${moduleName}:*`)) {
    return { restrictedToPublic: false, visibleSectionIds: [] };
  }

  const prefix = `${moduleName}:`;
  const visibleSectionIds = ctx.permissions
    .filter((perm) => perm.startsWith(prefix) && perm.split(':').length === 3)
    .map((perm) => perm.split(':')[2]);

  return { restrictedToPublic: true, visibleSectionIds };
};

// Les activitats no es reparteixen la visibilitat en un unic modul: els
// tipus GENERAL i TALLER depenen del modul ACTIVITIES, mentre que ASSEMBLEA
// i JUNTA depenen del modul ASSEMBLY, igual que a `canCreateActivity`).
// Aquesta regla mai bloqueja la consulta: calcula la visibilitat de cada
// domini per separat i la deixa a ctx.activityVisibility perque el service
// combini els dos filtres amb un OR segons el tipus de cada activitat.
const canViewActivities = rule({ cache: 'strict' })(
  async (parent, args, ctx) => {
    if (ctx.userId) {
      if (!ctx.permissions) {
        ctx.permissions = await usersService.getUserPermissions(ctx.userId);
      }
    } else {
      ctx.permissions = ctx.permissions || [];
    }

    ctx.activityVisibility = {
      GENERAL: computeDomainVisibility(ctx, 'ACTIVITIES'),
      ASSEMBLY: computeDomainVisibility(ctx, 'ASSEMBLY'),
    };

    return true;
  }
);

// Unica exportacio d'aquest fitxer
module.exports = {
  isAuthenticated,
  can,
  isOwner,
  canViewSections,
  canViewActivities,
  canCreateActivity
};