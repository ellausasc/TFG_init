// La funcio slugify es logica de negoci pura, per aixo viu aqui i no al repositori
const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")                   // Separa les lletres dels seus accents
    .replace(/[\u0300-\u036f]/g, "")     // Elimina els accents
    .toLowerCase()                       // Converteix tot a minuscules
    .trim()                              // Treu espais al principi i al final
    .replace(/[^a-z0-9\s-]/g, "")        // Esborra tot el que no sigui lletra, numero, espai o guio
    .replace(/[\s-]+/g, "-");            // Substitueix espais o multiples guions per un unic guio
};

// Combina un filtre "where" existent amb la restriccio de visibilitat calculada
// per graphql-shield (veure rules.js -> canViewSections). Si l'usuari no te
// permis total del modul, nomes pot veure el contingut public (segons
// publicCondition) o el contingut de les seccions on te permis explicit de
// lectura (visibility.visibleSectionIds).
const applyVisibilityFilter = (where, visibility, publicCondition, sectionField = 'sectionId') => {
  if (!visibility || !visibility.restrictedToPublic) return where;

  const sectionIds = (visibility.visibleSectionIds || [])
    .map((id) => parseInt(id, 10))
    .filter((id) => !Number.isNaN(id));

  const orConditions = sectionIds.length > 0
    ? [publicCondition, { [sectionField]: { in: sectionIds } }]
    : [publicCondition];

  return { AND: [where, { OR: orConditions }] };
};

// Extreu del context d'Apollo la informacio de visibilitat que la regla
// `canViewSections` (rules.js) hi ha deixat, en un format net per als resolvers.
const getVisibility = (context) => ({
  restrictedToPublic: !!context.restrictedToPublic,
  visibleSectionIds: context.visibleSectionIds || [],
});

// Igual que `getVisibility`, pero per a activitats: retorna la visibilitat
// calculada per separat per als dos dominis (ACTIVITIES per a GENERAL,
// ASSEMBLY per a ASSEMBLEA/JUNTA) que la regla `canViewActivities` ha deixat
// al context.
const getActivityVisibility = (context) => context.activityVisibility || {
  GENERAL: { restrictedToPublic: true, visibleSectionIds: [] },
  ASSEMBLY: { restrictedToPublic: true, visibleSectionIds: [] },
};

module.exports = {
  slugify,
  applyVisibilityFilter,
  getVisibility,
  getActivityVisibility
};