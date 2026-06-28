require('dotenv').config();
const prisma = require('../db.js');


async function test() {
  const res = await prisma.$queryRaw`SELECT current_user, current_database()`;
  console.log("Conectado como:", res);
}

async function main() {
  console.log("Inicio carga datos");

   const newsData = [
    { new_id: 1, title: "La primera", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), public: true, author: "Jhon", image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "new1" },
    { new_id: 2, title: "La primera", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), public: true, author: "Jhon", image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "new2" },
    { new_id: 3, title: "La primera", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), public: true, author: "Jhon", image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "new3" },
    { new_id: 4, title: "La primera", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), public: true, author: "Jhon", image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "new4" },
    { new_id: 5, title: "La primera", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), public: true, author: "Jhon", image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "new5" }
  ];

  for (const n of newsData) {
    await prisma.news.upsert({
      where: { slug: n.slug }, // Evita duplicados
      update: {},
      create: n,
    });
  }
  console.log(`${newsData.length} Noticias insertadas.`);

  const activitiesData = [
    { activity_id: 1, title: "La primera", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), activity_date: new Date("2026-03-09"), begin_inscription_date: new Date("2026-03-09"), end_inscription_date: new Date("2026-03-09"), public: true, image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "activity1" },
    { activity_id: 2, title: "La segona", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), activity_date: new Date("2026-03-09"), begin_inscription_date: new Date("2026-03-09"), end_inscription_date: new Date("2026-03-09"), public: true, image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "activity2" },
    { activity_id: 3, title: "La tercera", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), activity_date: new Date("2026-03-09"), begin_inscription_date: new Date("2026-03-09"), end_inscription_date: new Date("2026-03-09"), public: true, image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "activity3" },
    { activity_id: 4, title: "La cuarta", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), activity_date: new Date("2026-03-09"), begin_inscription_date: new Date("2026-03-09"), end_inscription_date: new Date("2026-03-09"), public: true, image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "activity4" },
    { activity_id: 5, title: "La cinquena", short_descr: "La primera noticia que s'ha fet mai, resum del que pot arribar a ser aixo...", sections: ["general", "global"], creation_date: new Date("2026-03-09"), publication_date: new Date("2026-03-09"), activity_date: new Date("2026-03-09"), begin_inscription_date: new Date("2026-03-09"), end_inscription_date: new Date("2026-03-09"), public: true, image_src: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?&fit=crop&w=430&h=240", image_alt: "frontend master", slug: "activity5" }
  ];

  for (const a of activitiesData) {
    await prisma.activity.upsert({
      where: { slug: a.slug },
      update: {},
      create: a,
    });
  }
  console.log(`${activitiesData.length} Actividades insertadas.`);
}

main()
  .catch((e) => {
    console.error("Error al insertar datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Base de datos desconectada.");
  });