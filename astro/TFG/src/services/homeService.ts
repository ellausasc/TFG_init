import { fetchGraphQL } from "../api";

const HOME_DATA_QUERY = `
  query GetHomeData {
    getNewsFiltered(page: 1, limit: 5) {
      items { id title shortDescription slug mainImage author { firstName lastName1 } }
    }
    getAllActivities {
      id title shortDescription activityDate slug mainImage
    }
  }
`;

export async function getHomeData() {
  const data = await fetchGraphQL<any>(HOME_DATA_QUERY);
  return data;
}