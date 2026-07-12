import { fetchGraphQL } from "../api";
import { HOME_DATA_QUERY } from "./graphql/home.queries";
import type { News, Activity } from "../types";

export async function getHomeData(): Promise<{ news: News[], activities: Activity[] }> {
  // Definimos exactamente qué forma tiene la query combinada
  interface HomeDataResponse {
    getNewsFiltered: { items: News[] };
    getFilteredActivities: { items: Activity[] };
  }

  const data = await fetchGraphQL<HomeDataResponse>(HOME_DATA_QUERY);
  
  return {
    news: data?.getNewsFiltered?.items || [],
    activities: data?.getFilteredActivities?.items || [],
  };
}