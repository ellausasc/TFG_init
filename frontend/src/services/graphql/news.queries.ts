export const GET_NEWS_BY_SLUG = `
  query GetNewsBySlug($slug: String!) {
    getNewsBySlug(slug: $slug) {
      id title shortDescription longDescription slug publishedAt mainImage status type
      author { firstName lastName1 }
      section { id name }
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

export const UPDATE_NEWS_MUTATION = `
  mutation UpdateNews($id: ID!, $input: UpdateNewsInput!) {
    updateNews(id: $id, input: $input) {
      id slug title
    }
  }
`;

// Vista d'administració: a diferencia de GET_NEWS_FILTERED_QUERY (usada pel
// portal public), aqui no s'aplica cap filtre de data/estat al client, ja
// que els administradors tambe han de poder trobar i editar els esborranys.
export const GET_NEWS_FILTERED_ADMIN_QUERY = `
  query GetNewsFilteredAdmin($page: Int, $limit: Int, $filter: NewsFilterInput, $sort: NewsSortInput) {
    getNewsFiltered(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      items {
        id title slug publishedAt status mainImage
        author { firstName lastName1 }
        section { name }
      }
      totalCount
    }
  }
`;