export const GET_NEWS_BY_SLUG = `
  query GetNewsBySlug($slug: String!) {
    getNewsBySlug(slug: $slug) {
      id title shortDescription longDescription slug publishedAt mainImage
      author { firstName lastName1 }
      section { name }
    }
  }
`;

export const GET_NEWS_FILTERED_QUERY = `
  query GetNewsFiltered($page: Int, $limit: Int, $filter: NewsFilterInput, $sort: NewsSortInput) {
    getNewsFiltered(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      items {
        id title shortDescription slug publishedAt status mainImage
        author { firstName lastName1 }
        section { name }
      }
      totalCount
    }
  }
`;

export const CREATE_NEWS_MUTATION = `
  mutation CreateNews($input: CreateNewsInput!) {
    createNews(input: $input) {
      slug title
    }
  }
`;