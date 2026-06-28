const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

export async function fetchGraphQL<T>(query: string, variables = {}): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    console.error("GraphQL Errors:", errors);
    throw new Error("Error al obtener datos del servidor");
  }

  return data;
}

// Queries predefinidas para mayor comodidad
export const HOME_DATA_QUERY = `
  query GetHomeData {
    getAllNews {
      new_id
      title
      short_descr
      sections
      publication_date
      public
      author
      slug
      image { src alt }
    }
    getAllActivities {
      activity_id
      title
      activity_date
      publication_date
      sections
      slug
      image { src alt }
    }
  }
`;

export const GET_NEWS_BY_SLUG = `
  query GetNewsBySlug($slug: String!) {
    getNewsBySlug(slug: $slug) {
      new_id
      title
      short_descr
      sections
      creation_date
      publication_date
      author
      slug
      image { src alt }
    }
  }
`;

export const GET_ACTIVITY_BY_SLUG = `
  query GetActivityBySlug($slug: String!) {
    getActivityBySlug(slug: $slug) {
      activity_id
      title
      short_descr
      sections
      activity_date
      begin_inscription_date
      end_inscription_date
      slug
      image { src alt }
    }
  }
`;


export async function getNewsBySlug(slug: string) {
  const data = await fetchGraphQL<{ getNewsBySlug: any }>(GET_NEWS_BY_SLUG, { slug });
  return data.getNewsBySlug;
}

export async function getActivityBySlug(slug: string) {
  const data = await fetchGraphQL<{ getActivityBySlug: any }>(GET_ACTIVITY_BY_SLUG, { slug });
  return data.getActivityBySlug;
}