import { fetchGraphQL } from "../api";
import { 
  GET_ALL_SECTIONS_QUERY, 
  GET_SECTION_BY_ID_QUERY, 
  CREATE_SECTION_MUTATION, 
  UPDATE_SECTION_MUTATION 
} from "./graphql/sections.queries";
import type { Section, CreateSectionInput, UpdateSectionInput } from "../types";

export async function getAllSections(
  headers: Record<string, string> = {},
): Promise<Section[]> {
  const data = await fetchGraphQL<{ getAllSections: Section[] }>(
    GET_ALL_SECTIONS_QUERY,
    {},
    headers,
  );
  return data?.getAllSections || [];
}

export async function getSectionById(id: string): Promise<Section | null> {
  const data = await fetchGraphQL<{ getSectionById: Section }>(GET_SECTION_BY_ID_QUERY, { id });
  return data?.getSectionById;
}

export async function createSection(input: CreateSectionInput, headers: Record<string, string> = {}): Promise<Section> {
  const data = await fetchGraphQL<{ createSection: Section }>(
    CREATE_SECTION_MUTATION,
    { input },
    headers
  );
  return data.createSection;
}

export async function updateSection(id: string, input: UpdateSectionInput, headers: Record<string, string> = {}): Promise<Section> {
  const data = await fetchGraphQL<{ updateSection: Section }>(
    UPDATE_SECTION_MUTATION,
    { id, input },
    headers
  );
  return data.updateSection;
}