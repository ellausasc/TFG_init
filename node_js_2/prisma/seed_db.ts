const prisma = require('../db.js');
const bcrypt = require('bcrypt');

async function main() {
  console.log('Iniciando el proceso de seed...');

  // ==========================================
  // 0. ELIMINAR DATOS PREVIOS
  // ==========================================
  console.log('Limpiando la base de datos...');
  await prisma.news.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.section.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.action.deleteMany();
  await prisma.module.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  
  // ==========================================
  // 1. Añadir Módulos
  // ==========================================
  console.log('Creando módulos...');
  const moduleNames = ['NEWS', 'ACTIVITIES', 'ROLES', 'USERS', 'SECTIONS', 'ASSEMBLY'];
  const createdModules = [];
  
  for (const name of moduleNames) {
    const mod = await prisma.module.create({
      data: { name, description: `Módulo de ${name}` },
    });
    createdModules.push(mod);
  }

  // ==========================================
  // 2. Añadir Acciones
  // ==========================================
  console.log('Creando acciones...');
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
  // 3. Añadir Rol ADMIN y Asignar TODOS los Permisos
  // ==========================================
  console.log('Creando rol ADMIN...');
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
    console.log('✅ Permisos totales asignados al rol ADMIN.');
  }

  // ==========================================
  // 4. Crear Sección por defecto
  // ==========================================
  console.log('Creando sección por defecto...');
  const defaultSection = await prisma.section.create({
    data: {
      name: 'General',
      description: 'Sección principal del sistema',
      isActive: true,
    }
  });

  // ==========================================
  // 5. Añadir Usuario y ASIGNARLE EL ROL ADMIN
  // ==========================================
  console.log('Creando usuario admin@admin.com...');
  const hashedPassword = await bcrypt.hash('admin', 10);

  const adminUser = await prisma.user.create({
    data: {
      code: 'ADM-001',
      firstName: 'Super',
      lastName1: 'Admin',
      dni: '00000000T',
      email: 'admin@admin.com',
      password: hashedPassword,
      // AQUÍ SE ASIGNA EL ROL AL USUARIO
      roles: {
        connect: [{ id: adminRole.id }] // Usamos un array de objetos para relaciones n:m
      }
    }
  });
  console.log(`✅ Usuario creado y rol ADMIN asignado a ${adminUser.email}.`);

  // ==========================================
  // 6. Añadir Noticia de Prueba
  // ==========================================
  console.log('Creando noticia de prueba...');
  await prisma.news.create({
    data: {
      title: '¡Bienvenido al nuevo sistema!',
      shortDescription: 'El sistema ha sido inicializado correctamente.',
      longDescription: 'Esta es una noticia de prueba generada automáticamente por la semilla de la base de datos.',
      slug: 'bienvenido-al-nuevo-sistema',
      status: 'PUBLISHED',
      type: 'INFO',
      authorId: adminUser.id,
      sectionId: defaultSection.id,
    }
  });

  // ==========================================
  // 7. Añadir Actividad de Prueba
  // ==========================================
  console.log('Creando actividad de prueba...');
  await prisma.activity.create({
    data: {
      title: 'Reunión de Inicialización',
      shortDescription: 'Primera reunión técnica del portal.',
      longDescription: 'Revisión general de módulos, roles y permisos cargados en el sistema.',
      slug: 'reunion-inicializacion',
      activityDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      status: true,
      authorId: adminUser.id,
      sectionId: defaultSection.id,
    }
  });

  console.log('🎉 Seed finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });