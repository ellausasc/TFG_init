export const HOME_DATA_QUERY = `
  query GetHomeData {
    getNewsFiltered(filter: { excludeSectionMain: true, onlyPublished: true }, 
                    page: 1, 
                    limit: 5) 
    {
      items { 
        id title shortDescription slug mainImage 
        author { firstName lastName1 } 
      }
    }
    getFilteredActivities(page: 1, limit: 5) {
      items {
        id title shortDescription activityDate slug mainImage
      }
    }
  }
`;