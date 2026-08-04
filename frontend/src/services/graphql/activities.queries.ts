export const GET_ACTIVITY_BY_SLUG = `
  query GetActivityBySlug($slug: String!) {
    getActivityBySlug(slug: $slug) {
      id title shortDescription longDescription createdAt publishedAt status type
      activityDate registrationStartDate registrationEndDate mainImage secondaryImage slug
      isPrivate
      author { firstName lastName1 }
      section { id name }
      participants { id }
      documents { id name url type createdAt }
    }
  }
`;

export const GET_ACTIVITY_BY_ID = `
  query GetActivityById($id: ID!) {
    getActivityById(id: $id) {
      id title shortDescription longDescription createdAt publishedAt status type
      activityDate registrationStartDate registrationEndDate mainImage secondaryImage slug
      isPrivate
      section { id name }
      documents { id name url type createdAt }
    }
  }
`;

export const GET_MY_ACTIVITIES_QUERY = `
  query GetMyActivities {
    getMyActivities {
      id title shortDescription slug publishedAt activityDate status mainImage type
      author { firstName lastName1 }
      section { name }
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

export const UPDATE_ACTIVITY_MUTATION = `
  mutation UpdateActivity($id: ID!, $input: CreateActivityInput!) {
    updateActivity(id: $id, input: $input) {
      id slug title
    }
  }
`;

export const ENROLL_MUTATION = `
  mutation EnrollInActivity($activityId: ID!) {
    enrollInActivity(activityId: $activityId)
  }
`;