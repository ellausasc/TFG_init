import { fetchGraphQL } from "../api";
import {
  GET_ACTIVITY_BY_SLUG,
  GET_ACTIVITY_BY_ID,
  GET_ACTIVITIES_FILTERED_QUERY,
  GET_MY_ACTIVITIES_QUERY,
  CREATE_ACTIVITY_MUTATION,
  UPDATE_ACTIVITY_MUTATION,
  ENROLL_MUTATION,
} from "./graphql/activities.queries";
import type {
  Activity,
  ActivityFilterInput,
  SortInput,
  CreateActivityInput,
} from "../types";

export async function getActivityBySlug(
  slug: string,
  headers: Record<string, string> = {},
): Promise<Activity | null> {
  const data = await fetchGraphQL<{ getActivityBySlug: Activity }>(
    GET_ACTIVITY_BY_SLUG,
    { slug },
    headers,
  );

  console.log("Fetched activity by slug:", data.getActivityBySlug);
  return data.getActivityBySlug;
}

export async function getActivities(
  params: {
    page?: number;
    limit?: number;
    filter?: ActivityFilterInput;
    sort?: SortInput;
  } = {},
  headers: Record<string, string> = {},
) {
  const variables = {
    page: params.page || 1,
    limit: params.limit || 25,
    filter: params.filter || {},
    sort: params.sort || { field: "activityDate", direction: "DESC" },
  };

  const data = await fetchGraphQL<{
    getFilteredActivities: { items: Activity[]; totalCount: number };
  }>(GET_ACTIVITIES_FILTERED_QUERY, variables, headers);

  return data?.getFilteredActivities || { items: [], totalCount: 0 };
}

export async function getActivityById(
  id: string,
  headers: Record<string, string> = {},
): Promise<Activity | null> {
  const data = await fetchGraphQL<{ getActivityById: Activity }>(
    GET_ACTIVITY_BY_ID,
    { id },
    headers,
  );
  return data.getActivityById;
}

export async function getMyActivities(
  headers: Record<string, string> = {},
): Promise<Activity[]> {
  const data = await fetchGraphQL<{ getMyActivities: Activity[] }>(
    GET_MY_ACTIVITIES_QUERY,
    {},
    headers,
  );
  return data?.getMyActivities || [];
}

export async function createActivity(
  input: CreateActivityInput,
  headers: Record<string, string> = {},
): Promise<Activity> {
  const data = await fetchGraphQL<{ createActivity: Activity }>(
    CREATE_ACTIVITY_MUTATION,
    { input },
    headers,
  );
  return data.createActivity;
}

export async function updateActivity(
  id: string,
  input: Partial<CreateActivityInput>,
  headers: Record<string, string> = {},
): Promise<Activity> {
  const data = await fetchGraphQL<{ updateActivity: Activity }>(
    UPDATE_ACTIVITY_MUTATION,
    { id, input },
    headers,
  );
  return data.updateActivity;
}

export async function enrollInActivity(
  activityId: string,
  headers: Record<string, string> = {},
): Promise<boolean> {
  const data = await fetchGraphQL<{ enrollInActivity: boolean }>(
    ENROLL_MUTATION,
    { activityId },
    headers,
  );
  return data.enrollInActivity;
}
