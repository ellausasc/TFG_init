import { fetchGraphQL } from "../api";

const GET_ACTIVITY_BY_SLUG = `
  query GetActivityBySlug($slug: String!) {
    getActivityBySlug(slug: $slug) {
      id title shortDescription longDescription activityDate 
      registrationStartDate registrationEndDate slug mainImage
    }
  }
`;

export async function getActivityBySlug(slug: string) {
  const data = await fetchGraphQL<{ getActivityBySlug: any }>(GET_ACTIVITY_BY_SLUG, { slug });
  return data.getActivityBySlug;
}