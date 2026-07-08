// src/services/homeService.ts
import { fetchGraphQL } from "../api";

const HOME_DATA_QUERY = `
  query GetHomeData {
    # Obtenim les 5 últimes notícies
    getNewsFiltered(page: 1, limit: 5) {
      items { 
        id 
        title 
        shortDescription 
        slug 
        mainImage 
        author { 
          firstName 
          lastName1 
        } 
      }
    }
    
    # Obtenim les 5 pròximes activitats mitjançant la nova query filtrada/paginada
    getFilteredActivities(page: 1, limit: 5) {
      items {
        id 
        title 
        shortDescription 
        activityDate 
        slug 
        mainImage
      }
    }
  }
`;

/**
 * Obté les dades per a la pàgina d'inici (Home).
 * Ara ambdues consultes són paginades per millorar el rendiment.
 */
export async function getHomeData() {
  const data = await fetchGraphQL<any>(HOME_DATA_QUERY);
  
  return {
    news: data?.getNewsFiltered?.items || [],
    activities: data?.getFilteredActivities?.items || [],
  };
}