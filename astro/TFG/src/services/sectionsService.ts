import { fetchGraphQL } from "../api";

// --- QUERIES ---

const GET_ALL_SECTIONS_QUERY = `
  query GetAllSections {
    getAllSections {
      id
      name
      description
      isActive
      publishedAt
    }
  }
`;

const GET_SECTION_BY_ID_QUERY = `
  query GetSectionById($id: ID!) {
    getSectionById(id: $id) {
      id
      name
      description
      isActive
      publishedAt
      # Afegim els detalls a la notícia principal (la que edites al formulari)
      mainNews {
        id
        title
        shortDescription
        longDescription
      }
      # Afegim els detalls a la llista de notícies associades
      news {
        id
        title
        slug
        shortDescription
        longDescription
      }
    }
  }
`;

// --- MUTATIONS ---

const CREATE_SECTION_MUTATION = `
  mutation CreateSection($input: CreateSectionInput!) {
    createSection(input: $input) {
      id
      name
    }
  }
`;

const UPDATE_SECTION_MUTATION = `
  mutation UpdateSection($id: ID!, $input: UpdateSectionInput!) {
    updateSection(id: $id, input: $input) {
      id
      name
    }
  }
`;

// --- FUNCIONES ---

/**
 * Obtiene todas las secciones disponibles
 */
export async function getAllSections() {
  const data = await fetchGraphQL<{ getAllSections: any[] }>(GET_ALL_SECTIONS_QUERY);
  return data?.getAllSections || [];
}

/**
 * Obtiene una sección específica por su ID
 */
export async function getSectionById(id: string) {
  const data = await fetchGraphQL<{ getSectionById: any }>(GET_SECTION_BY_ID_QUERY, { id });
  return data?.getSectionById;
}

/**
 * Crea una nueva sección (Requiere autenticación)
 */
export async function createSection(input: any, token: string) {
  const response = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      query: CREATE_SECTION_MUTATION,
      variables: { input }
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.createSection;
}

/**
 * Actualiza una sección existente (Requiere autenticación)
 */
export async function updateSection(id: string, input: any, token: string) {
  const response = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      query: UPDATE_SECTION_MUTATION,
      variables: { id, input }
    }),
  });

  console.log("Body sent to server:", JSON.stringify({
    query: UPDATE_SECTION_MUTATION,
    variables: { id, input }
  }));

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.updateSection;
}