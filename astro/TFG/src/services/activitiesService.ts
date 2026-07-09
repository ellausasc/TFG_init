import { fetchGraphQL } from "../api";
import { 
  GET_ACTIVITY_BY_SLUG, 
  GET_ACTIVITIES_FILTERED_QUERY, 
  CREATE_ACTIVITY_MUTATION 
} from "./graphql/activities.queries";

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

export async function createActivity(input: any, headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<{ createActivity: any }>(
    CREATE_ACTIVITY_MUTATION,
    { input },
    headers
  );
  return data.createActivity;
}