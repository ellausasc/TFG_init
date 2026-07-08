// src/services/activitiesService.ts
import { fetchGraphQL } from "../api";

// --- QUERIES ---

const GET_ACTIVITY_BY_SLUG = `
  query GetActivityBySlug($slug: String!) {
    getActivityBySlug(slug: $slug) {
      id
      title
      shortDescription
      longDescription
      createdAt
      publishedAt
      status
      type
      activityDate
      registrationStartDate
      registrationEndDate
      mainImage
      secondaryImage
      slug
      author { firstName lastName1 }
      section { name }
      participants { id }
    }
  }
`;

const GET_ACTIVITIES_FILTERED_QUERY = `
  query GetFilteredActivities($page: Int, $limit: Int, $filter: ActivityFilterInput, $sort: SortInput) {
    getFilteredActivities(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      items {
        id
        title
        shortDescription
        slug
        publishedAt
        activityDate
        status
        mainImage
        author { firstName lastName1 }
        section { name }
      }
      totalCount
    }
  }
`;

const CREATE_ACTIVITY_MUTATION = `
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      id
      slug
      title
    }
  }
`;

const ENROLL_MUTATION = `
  mutation EnrollInActivity($activityId: ID!) {
    enrollInActivity(activityId: $activityId)
  }
`;

// --- FUNCIONES ---

export async function getActivityBySlug(slug: string) {
  const data = await fetchGraphQL<{ getActivityBySlug: any }>(GET_ACTIVITY_BY_SLUG, { slug });
  return data.getActivityBySlug;
}

export async function getActivities(params: { 
  page?: number, 
  limit?: number, 
  filter?: any,
  sort?: { field: string, direction: 'ASC' | 'DESC' } 
} = {}) {
  const variables = {
    page: params.page || 1,
    limit: params.limit || 25,
    filter: params.filter || {},
    sort: params.sort || { field: "activityDate", direction: "DESC" }
  };

  const data = await fetchGraphQL<{ getFilteredActivities: { items: any[], totalCount: number } }>(
    GET_ACTIVITIES_FILTERED_QUERY, 
    variables
  );

  return data?.getFilteredActivities || { items: [], totalCount: 0 };
}


export async function createActivity(input: any, token?: string) {
  // Inicialitzem explícitament com a Record<string, string>
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const data = await fetchGraphQL<{ createActivity: any }>(
    CREATE_ACTIVITY_MUTATION,
    { input },
    headers
  );
  return data.createActivity;
}

/**
 * Nova funció per inscriure un usuari a una activitat
 */

/*
export async function enrollInActivity(activityId: string, token: string) {
  const data = await fetchGraphQL<{ enrollInActivity: boolean }>(
    ENROLL_MUTATION, 
    { activityId }, 
    token
  );
  return data.enrollInActivity;
}  */