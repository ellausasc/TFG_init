import { fetchGraphQL } from "../api";
import { 
  GET_NEWS_BY_SLUG, 
  GET_NEWS_FILTERED_QUERY, 
  CREATE_NEWS_MUTATION 
} from "./graphql/news.queries";

export async function getNewsBySlug(slug: string) {
  const data = await fetchGraphQL<{ getNewsBySlug: any }>(GET_NEWS_BY_SLUG, { slug });
  return data.getNewsBySlug;
}

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

  const items = result.items.filter((news: any) => 
    news.status && news.publishedAt && new Date(news.publishedAt) <= new Date()
  );

  return { items, totalCount: result.totalCount };
}

export async function createNews(input: any, headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<{ createNews: any }>(
    CREATE_NEWS_MUTATION,
    { input },
    headers
  );
  return data.createNews;
}