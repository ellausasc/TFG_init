import { fetchGraphQL } from "../api";

// --- QUERIES I MUTACIONS ---

const GET_NEWS_BY_SLUG = `
  query GetNewsBySlug($slug: String!) {
    getNewsBySlug(slug: $slug) {
      id
      title
      shortDescription
      longDescription
      slug
      publishedAt
      mainImage
      author {
        firstName
        lastName1
      }
      section {
        name
      }
    }
  }
`;

const GET_NEWS_FILTERED_QUERY = `
  query GetNewsFiltered($page: Int, $limit: Int, $filter: NewsFilterInput, $sort: NewsSortInput) {
    getNewsFiltered(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      items {
        id
        title
        shortDescription
        slug
        publishedAt
        status
        mainImage
        author {
          firstName
          lastName1
        }
        section {
          name
        }
      }
      totalCount
    }
  }
`;

const CREATE_NEWS_MUTATION = `
  mutation CreateNews($input: CreateNewsInput!) {
    createNews(input: $input) {
      slug
      title
    }
  }
`;

// --- FUNCIONS ---

/**
 * Obté una notícia específica pel seu slug
 */
export async function getNewsBySlug(slug: string) {
  const data = await fetchGraphQL<{ getNewsBySlug: any }>(GET_NEWS_BY_SLUG, { slug });
  return data.getNewsBySlug;
}

/**
 * Obté un llistat de notícies amb filtres, paginació i ordenació.
 * Si no es passen paràmetres, utilitza valors per defecte.
 */
export async function getNews(params: { 
  page?: number, 
  limit?: number, 
  filter?: any,
  sort?: { field: string, direction: 'ASC' | 'DESC' } 
} = {}) {
  
  const variables = {
    page: params.page || 1,
    limit: params.limit || 25,
    filter: params.filter || {},
    sort: params.sort || { field: "publishedAt", direction: "DESC" }
  };

  const data = await fetchGraphQL<{ getNewsFiltered: { items: any[], totalCount: number } }>(
    GET_NEWS_FILTERED_QUERY, 
    variables
  );

  const result = data?.getNewsFiltered || { items: [], totalCount: 0 };

  // Filtre local addicional per assegurar la data en el frontend
  const items = result.items.filter((news: any) => 
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
export async function createNews(input: any, token: string) {
  // Passem el token dins l'objecte de capçaleres a fetchGraphQL.
  // Els errors ja els gestiona el propi fitxer api.ts automàticament.
  const data = await fetchGraphQL<{ createNews: any }>(
    CREATE_NEWS_MUTATION,
    { input },
    { Authorization: `Bearer ${token}` }
  );

  return data.createNews;
}