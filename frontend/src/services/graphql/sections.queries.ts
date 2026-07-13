export const GET_ALL_SECTIONS_QUERY = `
  query GetAllSections {
    getAllSections {
      id name description isActive publishedAt
    }
  }
`;

export const GET_SECTION_BY_ID_QUERY = `
  query GetSectionById($id: ID!) {
    getSectionById(id: $id) {
      id name description isActive publishedAt
      mainNews {
        id title shortDescription longDescription
      }
      news {
        id title slug shortDescription longDescription
      }
    }
  }
`;

export const CREATE_SECTION_MUTATION = `
  mutation CreateSection($input: CreateSectionInput!) {
    createSection(input: $input) {
      id name
    }
  }
`;

export const UPDATE_SECTION_MUTATION = `
  mutation UpdateSection($id: ID!, $input: UpdateSectionInput!) {
    updateSection(id: $id, input: $input) {
      id name
    }
  }
`;