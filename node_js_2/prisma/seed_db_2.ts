const prisma = require('../db.js');

async function main() {
  console.log("Inicio carga de datos...");

  // 1. Crear/Asegurar Usuario (Cumpliendo con tu modelo User)
  const author = await prisma.user.upsert({
    where: { email: "admin@tfg.com" },
    update: {},
    create: {
      email: "admin@tfg.com",
      firstName: "Admin",
      lastName1: "Test",
      dni: "12345678X",
      password: "password123",
      code: "ADM001", // Obligatorio en tu esquema
      isFeePaid: true
    }
  });

  // 2. Crear/Asegurar Sección
  const section = await prisma.section.upsert({
    where: { name: "General" },
    update: {},
    create: {
      name: "General",
      description: "Sección principal",
      isActive: true
    }
  });

  // 3. Insertar Noticias (Usando camelCase estricto)
  const newsData = [
    { 
      title: "La primera", 
      shortDescription: "Resumen noticia 1", 
      longDescription: "Descripción larga y detallada de la noticia 1.", 
      slug: "new1", 
      status: true,
      mainImage: "https://ejemplo.com/img1.jpg"
    },
    { 
      title: "La segunda", 
      shortDescription: "Resumen noticia 2", 
      longDescription: "Descripción larga y detallada de la noticia 2.", 
      slug: "new2", 
      status: true,
      mainImage: "https://ejemplo.com/img2.jpg"
    }
  ];

  for (const n of newsData) {
    await prisma.news.upsert({
      where: { slug: n.slug },
      update: {},
      create: {
        ...n,
        author: { connect: { id: author.id } },
        section: { connect: { id: section.id } }
      },
    });
  }
  console.log("Noticias insertadas.");

  // 4. Insertar Actividades
  const activitiesData = [
    { 
      title: "Actividad 1", 
      shortDescription: "Breve resumen", 
      longDescription: "Descripción extensa...", 
      activityDate: new Date().toISOString(), 
      slug: "activity1",
      status: true
    }
  ];

  for (const a of activitiesData) {
    await prisma.activity.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        ...a,
        author: { connect: { id: author.id } }, // Obligatorio
        section: { connect: { id: section.id } }
      },
    });
  }
  console.log("Actividades insertadas.");
}

main()
  .catch((e) => {
    console.error("Error completo:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });