// src/services/newsService.ts
import { fetchGraphQL } from "../api";
import { 
  GET_NEWS_BY_SLUG, 
  GET_NEWS_FILTERED_QUERY, 
  CREATE_NEWS_MUTATION 
} from "./graphql/news.queries";

// 1. IMPORTAMOS NUESTRAS INTERFACES
import type { News, NewsFilterInput, SortInput, CreateNewsInput } from "../types";

/**
 * Obté una notícia específica pel seu slug
 * Devolvemos Promise<News | null> para indicar que podría no encontrarla
 */
export async function getNewsBySlug(slug: string): Promise<News | null> {
  // Substituim l'any generic per 'News'
  const data = await fetchGraphQL<{ getNewsBySlug: News }>(GET_NEWS_BY_SLUG, { slug });
  return data.getNewsBySlug;
}

/**
 * Obté un llistat de notícies amb filtres, paginació i ordenació.
 */
export async function getNews(params: { 
  page?: number; 
  limit?: number; 
  filter?: NewsFilterInput; // Adiós al 'any'
  sort?: SortInput; // Adiós al objeto genérico
} = {}) {
  
  const variables = {
    page: params.page || 1,
    limit: params.limit || 25,
    filter: params.filter || {},
    sort: params.sort || { field: "publishedAt", direction: "DESC" }
  };

  // Definimos la forma exacta de la respuesta de GraphQL
  interface FilteredResponse {
    getNewsFiltered: { items: News[]; totalCount: number }
  }

  const data = await fetchGraphQL<FilteredResponse>(
    GET_NEWS_FILTERED_QUERY, 
    variables
  );

  const result = data?.getNewsFiltered || { items: [], totalCount: 0 };

  // Filtre local addicional. Reemplazamos (news: any) por (news: News)
  const items = result.items.filter((news: News) => 
    news.status && news.publishedAt && new Date(news.publishedAt) <= new Date()
  );

  return { 
    items, 
    totalCount: result.totalCount 
  };
}

/**
 * Crea una nova notícia utilitzant la funció centralitzada.
 */
export async function createNews(input: CreateNewsInput, headers: Record<string, string> = {}): Promise<News> {
  // Sustituimos 'input: any' por 'CreateNewsInput'
  const data = await fetchGraphQL<{ createNews: News }>(
    CREATE_NEWS_MUTATION,
    { input },
    headers
  );

  return data.createNews;
}