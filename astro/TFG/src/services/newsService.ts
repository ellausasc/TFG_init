import { fetchGraphQL } from "../api";

// --- QUERIES ---

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
      tags {
        description
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

// --- FUNCIONES ---

/**
 * Obtiene una noticia específica por su slug
 */
export async function getNewsBySlug(slug: string) {
  const data = await fetchGraphQL<{ getNewsBySlug: any }>(GET_NEWS_BY_SLUG, { slug });
  return data.getNewsBySlug;
}

/**
 * Obtiene un listado de noticias con filtros, paginación y ordenación.
 * Si no se pasan parámetros, usa valores por defecto.
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

  // Opcional: Filtro local adicional si necesitas asegurar la fecha en el frontend
  // Aunque lo ideal es que esto lo gestione el backend directamente.
  const items = result.items.filter((news: any) => 
    news.status && news.publishedAt && new Date(news.publishedAt) <= new Date()
  );

  return { 
    items, 
    totalCount: result.totalCount 
  };
}

export async function createNews(input: any, token: string) {
  // Nota: Asegúrate de que esta URL sea correcta según tu entorno
  const response = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      query: CREATE_NEWS_MUTATION,
      variables: { input }
    }),
  });

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return result.data.createNews;
}