// src/types/index.ts

// ==========================================
// 1. ENTITATS PRINCIPALS
// ==========================================

export interface User {
  id: string;
  code: string;
  firstName: string;
  lastName1: string;
  lastName2?: string;
  dni: string;
  phone?: string;
  email: string;
  birthDate?: string;
  createdAt: string;
  deletedAt?: string;
  profileImage?: string;
  roles?: Role[];
}

export interface Role {
  id: string;
  description: string;
  users?: User[];
  permission?: RolePermission[];
}

export interface Module {
  id: string;
  name: string;
  description?: string;
}

export interface Action {
  id: string;
  action: string;
  description: string;
}

export interface RolePermission {
  id: string;
  role?: Role;
  module: Module;
  action: Action;
  section?: Section;
}

export interface Section {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  publishedAt?: string;
  isActive: boolean;
  mainNews?: News;
  news?: News[];
  activities?: Activity[];
}

export interface News {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  createdAt: string;
  publishedAt?: string;
  status?: string;
  type?: string;
  mainImage?: string;
  secondaryImage?: string;
  slug: string;
  author?: Partial<User>;
  section?: Partial<Section>;
}

export interface ActivityDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  createdAt: string;
  publishedAt?: string;
  status?: string;
  type?: string;
  activityDate: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  capacity?: number;
  mainImage?: string;
  secondaryImage?: string;
  slug: string;
  isPrivate?: boolean;
  author?: Partial<User>;
  section?: Partial<Section>;
  participants?: Partial<User>[];
  documents?: ActivityDocument[];
}

export interface AuthPayload {
  token: string;
  user: User;
}

// ==========================================
// 2. INPUTS I FILTRES PER A LES QUERIES/MUTACIONS
// ==========================================

export interface SortInput {
  field?: string;
  direction?: 'ASC' | 'DESC';
}

export interface CreateNewsInput {
  title: string;
  shortDescription: string;
  longDescription: string;
  status?: string;
  type?: string;
  publishedAt?: string;
  secondaryImage?: string;
  sectionId: number;
}

export interface NewsFilterInput {
  title?: string;
  sectionId?: number;
  authorId?: number;
}

export interface AttachmentInput {
  name: string;
  url: string;
  type: string;
}

export interface CreateActivityInput {
  title: string;
  shortDescription: string;
  longDescription: string;
  status?: string;
  type?: string;
  isPrivate?: boolean;
  activityDate: string;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  capacity?: number | null;
  mainImage?: string;
  secondaryImage?: string;
  sectionId: number;
  attachments?: AttachmentInput[];
  removeDocumentIds?: string[];
}

export interface ActivityFilterInput {
  title?: string;
  sectionId?: number;
  authorId?: number;
  location?: string;
  status?: string;
  type?: string;
  types?: string[];
}

export interface CreateSectionInput {
  name: string;
  description?: string;
  isActive?: boolean;
  publishedAt?: string;
  mainNews: {
    title: string;
    shortDescription: string;
    longDescription: string;
    status?: string;
    type?: string;
    secondaryImage?: string;
  };
}

export interface UpdateSectionInput extends Partial<CreateSectionInput> {}

export interface AddPermissionToRoleInput {
  roleId: string | number;
  moduleId: string | number;
  actionId: string | number;
  sectionId?: string | number | null;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName1?: string;
  lastName2?: string;
  dni?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  profileImage?: string;
}

export interface RegisterUserInput extends UpdateUserInput {
  firstName: string; // Fem obligatoris els camps de registre
  lastName1: string;
  dni: string;
  email: string;
  password?: string;
}