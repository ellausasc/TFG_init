import { fetchGraphQL } from "../api";
import { 
  GET_ALL_SECTIONS_QUERY, 
  GET_SECTION_BY_ID_QUERY, 
  CREATE_SECTION_MUTATION, 
  UPDATE_SECTION_MUTATION 
} from "./graphql/sections.queries";

export async function getAllSections() {
  const data = await fetchGraphQL<{ getAllSections: any[] }>(GET_ALL_SECTIONS_QUERY);
  return data?.getAllSections || [];
}

export async function getSectionById(id: string) {
  const data = await fetchGraphQL<{ getSectionById: any }>(GET_SECTION_BY_ID_QUERY, { id });
  return data?.getSectionById;
}

export async function createSection(input: any, headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<{ createSection: any }>(
    CREATE_SECTION_MUTATION,
    { input },
    headers
  );
  return data.createSection;
}

export async function updateSection(id: string, input: any, headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<{ updateSection: any }>(
    UPDATE_SECTION_MUTATION,
    { id, input },
    headers
  );
  return data.updateSection;
}