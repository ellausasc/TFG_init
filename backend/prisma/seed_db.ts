const prisma = require('../src/config/db.js');
const bcrypt = require('bcrypt');

async function main() {
  console.log('Iniciant el proces de seed...');

  // ==========================================
  // 0. ELIMINAR DADES PREVIES
  // ==========================================
  console.log('Netejant la base de dades...');
  await prisma.news.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.section.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.action.deleteMany();
  await prisma.module.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // ==========================================
  // 1. Afegir Moduls
  // ==========================================
  console.log('Creant moduls...');
  const moduleNames = ['NEWS', 'ACTIVITIES', 'ROLES', 'USERS', 'SECTIONS', 'ASSEMBLY'];
  const createdModules = [];

  for (const name of moduleNames) {
    const mod = await prisma.module.create({
      data: { name, description: `Modul de ${name}` },
    });
    createdModules.push(mod);
  }

  // ==========================================
  // 2. Afegir Accions
  // ==========================================
  console.log('Creant accions...');
  const actionData = [
    { action: '* ', description: 'all' },
    { action: '01', description: 'create' },
    { action: '02', description: 'update' },
    { action: '03', description: 'read' },
    { action: '04', description: 'delete' }
  ];

  const createdActions = [];

  for (const item of actionData) {
    const act = await prisma.action.create({
      data: { action: item.action, description: item.description },
    });
    createdActions.push(act);
  }

  // ==========================================
  // 3. Afegir Rol ADMIN i Assignar TOTS els Permisos
  // ==========================================
  console.log('Creant rol ADMIN...');
  const adminRole = await prisma.role.create({
    data: { description: 'ADMIN' },
  });

  const actionAll = createdActions.find(a => a.description === 'all');
  if (actionAll) {
    for (const mod of createdModules) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          moduleId: mod.id,
          actionId: actionAll.id,
          sectionId: null, // Global
        },
      });
    }
    console.log('Permisos totals assignats al rol ADMIN.');
  }

  // ==========================================
  // 4. Crear Seccio per defecte
  // ==========================================
  console.log('Creant seccio per defecte...');
  const defaultSection = await prisma.section.create({
    data: {
      name: 'General',
      description: 'Seccio principal del sistema',
      isActive: true,
    }
  });

  // ==========================================
  // 5. Afegir Usuari i ASSIGNAR-LI EL ROL ADMIN
  // ==========================================
  console.log('Creant usuari admin@admin.com...');
  const hashedPassword = await bcrypt.hash('admin', 10);

  const adminUser = await prisma.user.create({
    data: {
      code: 'ADM-001',
      firstName: 'Super',
      lastName1: 'Admin',
      dni: '00000000T',
      email: 'admin@admin.com',
      password: hashedPassword,
      // Aqui s'assigna el rol a l'usuari
      roles: {
        connect: [{ id: adminRole.id }] // Fem servir un array d'objectes per a relacions n:m
      }
    }
  });
  console.log(`Usuari creat i rol ADMIN assignat a ${adminUser.email}.`);

  // ==========================================
  // 6. Afegir Noticia de Prova
  // ==========================================
  console.log('Creant noticia de prova...');
  await prisma.news.create({
    data: {
      title: 'Benvingut al nou sistema!',
      shortDescription: 'El sistema s\'ha inicialitzat correctament.',
      longDescription: 'Aquesta es una noticia de prova generada automaticament per la llavor de la base de dades.',
      slug: 'benvingut-al-nou-sistema',
      status: 'PUBLISHED',
      type: 'INFO',
      authorId: adminUser.id,
      sectionId: defaultSection.id,
    }
  });

  // ==========================================
  // 7. Afegir Activitat de Prova
  // ==========================================
  console.log('Creant activitat de prova...');
  await prisma.activity.create({
    data: {
      title: 'Reunio d\'inicialitzacio',
      shortDescription: 'Primera reunio tecnica del portal.',
      longDescription: 'Revisio general de moduls, rols i permisos carregats al sistema.',
      slug: 'reunio-inicialitzacio',
      activityDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      status: 'PUBLISHED',
      authorId: adminUser.id,
      sectionId: defaultSection.id,
    }
  });

  console.log('Seed finalitzat amb exit.');
}

main()
  .catch((e) => {
    console.error("Error durant el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });