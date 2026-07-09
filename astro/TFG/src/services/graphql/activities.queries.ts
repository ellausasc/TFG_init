export const GET_ACTIVITY_BY_SLUG = `
  query GetActivityBySlug($slug: String!) {
    getActivityBySlug(slug: $slug) {
      id title shortDescription longDescription createdAt publishedAt status type
      activityDate registrationStartDate registrationEndDate mainImage secondaryImage slug
      author { firstName lastName1 }
      section { name }
      participants { id }
    }
  }
`;

export const GET_ACTIVITIES_FILTERED_QUERY = `
  query GetFilteredActivities($page: Int, $limit: Int, $filter: ActivityFilterInput, $sort: SortInput) {
    getFilteredActivities(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      items {
        id title shortDescription slug publishedAt activityDate status mainImage
        author { firstName lastName1 }
        section { name }
      }
      totalCount
    }
  }
`;

export const CREATE_ACTIVITY_MUTATION = `
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      id slug title
    }
  }
`;

export const ENROLL_MUTATION = `
  mutation EnrollInActivity($activityId: ID!) {
    enrollInActivity(activityId: $activityId)
  }
`;