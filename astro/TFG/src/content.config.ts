
//import { defineCollection } from "astro:content";
// import { glob } from "astro/loaders";
// import { z } from "astro/zod";

// const blogCollection = defineCollection({
//  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
//  schema: z.object({
//    draft: z.boolean(),
//    title: z.string(),
//    snippet: z.string(),
//    image: z.object({
//      src: z.string(),
//      alt: z.string(),
//    }),
//    publishDate: z.coerce.date(),
//    author: z.string().default('Astroship'),
//    category: z.string(),
//    tags: z.array(z.string()),
//    slug: z.string()
//  }),
//});

// const newsCollection = defineCollection({
//  loader: glob({ base: "./src/content/news", pattern: "**/*.md" }),
//  schema: z.object({
//    new_id: z.number().int(),
//    title: z.string(),
//    short_descr: z.string(),
//    sections: z.array(z.string()), 
//    creation_date: z.coerce.date(),
//    publication_date: z.coerce.date(),
//    public: z.boolean(),
//    author: z.string(),
//    image: z.object({
//      src: z.string(),
//      alt: z.string(),
//    }),
//    slug: z.string()
//  }),
//});

//const activitiesCollection = defineCollection({
//  loader: glob({ base: "./src/content/activities", pattern: "**/*.md" }),
//  schema: z.object({
//    activity_id: z.number().int(),
//    title: z.string(),
//    short_descr: z.string(),
//    sections: z.array(z.string()), 
//    creation_date: z.coerce.date(),
//    publication_date: z.coerce.date(),
//    activity_date: z.coerce.date(),
//    begin_inscription_date: z.coerce.date(),
//    end_inscription_date: z.coerce.date(),
//    public: z.boolean(),
//    image: z.object({
//      src: z.string(),
//      alt: z.string(),
//    }),
//    slug: z.string()
//  }),
//});

//export const collections = {
//  blog: blogCollection,
//  news: newsCollection,
//  activities: activitiesCollection,
//};