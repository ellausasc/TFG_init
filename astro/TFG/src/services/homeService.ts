import { fetchGraphQL } from "../api";
import { HOME_DATA_QUERY } from "./graphql/home.queries";

export async function getHomeData() {
  const data = await fetchGraphQL<any>(HOME_DATA_QUERY);
  
  return {
    news: data?.getNewsFiltered?.items || [],
    activities: data?.getFilteredActivities?.items || [],
  };
}