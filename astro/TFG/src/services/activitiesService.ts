import { fetchGraphQL } from "../api";
import { 
  GET_ACTIVITY_BY_SLUG, 
  GET_ACTIVITIES_FILTERED_QUERY, 
  CREATE_ACTIVITY_MUTATION,
  ENROLL_MUTATION
} from "./graphql/activities.queries";
import type { Activity, ActivityFilterInput, SortInput, CreateActivityInput } from "../types";

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  const data = await fetchGraphQL<{ getActivityBySlug: Activity }>(GET_ACTIVITY_BY_SLUG, { slug });
  return data.getActivityBySlug;
}

export async function getActivities(params: { 
  page?: number; 
  limit?: number; 
  filter?: ActivityFilterInput;
  sort?: SortInput; 
} = {}) {
  const variables = {
    page: params.page || 1,
    limit: params.limit || 25,
    filter: params.filter || {},
    sort: params.sort || { field: "activityDate", direction: "DESC" }
  };

  const data = await fetchGraphQL<{ getFilteredActivities: { items: Activity[], totalCount: number } }>(
    GET_ACTIVITIES_FILTERED_QUERY, 
    variables
  );

  return data?.getFilteredActivities || { items: [], totalCount: 0 };
}

export async function createActivity(input: CreateActivityInput, headers: Record<string, string> = {}): Promise<Activity> {
  const data = await fetchGraphQL<{ createActivity: Activity }>(
    CREATE_ACTIVITY_MUTATION,
    { input },
    headers
  );
  return data.createActivity;
}

export async function enrollInActivity(activityId: string, headers: Record<string, string> = {}): Promise<boolean> {
  const data = await fetchGraphQL<{ enrollInActivity: boolean }>(
    ENROLL_MUTATION,
    { activityId },
    headers
  );
  return data.enrollInActivity;
}