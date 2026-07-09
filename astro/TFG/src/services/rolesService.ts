// src/services/permissionsService.ts

import { fetchGraphQL } from "../api";
import { 
  GET_ALL_ROLES_WITH_PERMISSIONS, 
  GET_MODULES_AND_ACTIONS,
  GET_ROLE_FORM_DATA,
  CREATE_ROLE_MUTATION,
  ADD_PERMISSION_MUTATION,
  GET_ROLE_BY_ID,
  GET_ALL_USERS_BASIC,
  UPDATE_ROLE_MUTATION,
  REMOVE_PERMISSION_MUTATION,
  ASSIGN_ROLE_USER_MUTATION,
  REMOVE_ROLE_USER_MUTATION
} from "./graphql/roles.queries";

// ==========================================
// QUERIES (SSR o Cliente)
// Mantenemos 'headers' para poder pasar la cookie en el SSR de Astro
// ==========================================

export async function getAllRolesWithPermissions(headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<{ getAllRoles: any[] }>(
    GET_ALL_ROLES_WITH_PERMISSIONS, 
    {}, 
    headers
  );
  return data.getAllRoles || [];
}

export async function getModulesAndActions(headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<{ getAllModules: any[], getAllActions: any[] }>(
    GET_MODULES_AND_ACTIONS, 
    {}, 
    headers
  );
  return {
    modules: data.getAllModules || [],
    actions: data.getAllActions || []
  };
}

export async function getRoleFormData(headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<any>(
    GET_ROLE_FORM_DATA, 
    {}, 
    headers
  );
  return {
    modules: data.getAllModules || [],
    actions: data.getAllActions || [],
    sections: data.getAllSections || []
  };
}


// ==========================================
// MUTACIONES (Solo Cliente)
// Eliminamos el parámetro 'token'. El navegador enviará la cookie automáticamente.
// ==========================================

/**
 * Crea un nou rol al sistema
 */
export async function createRole(description: string) {
  const data = await fetchGraphQL<{ createRole: any }>(
    CREATE_ROLE_MUTATION,
    { input: { description } }
  );
  
  return data.createRole;
}

/**
 * Afegeix un permís específic a un rol
 */
export async function addPermissionToRole(input: {
  roleId: string | number;
  moduleId: string | number;
  actionId: string | number;
  sectionId?: string | number | null;
}) {
  const data = await fetchGraphQL<{ addPermissionToRole: any }>(
    ADD_PERMISSION_MUTATION,
    { input }
  );
  
  return data.addPermissionToRole;
}

export async function getRoleById(id: string, headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<{ getRoleById: any }>(GET_ROLE_BY_ID, { id }, headers);
  return data.getRoleById;
}

export async function getAllUsersBasic(headers: Record<string, string> = {}) {
  // Ajusta aquesta funció segons com es digui la teva query real d'usuaris
  const data = await fetchGraphQL<{ getAllUsers: any[] }>(GET_ALL_USERS_BASIC, {}, headers);
  return data.getAllUsers || [];
}

export async function updateRole(id: string, description: string) {
  return await fetchGraphQL(UPDATE_ROLE_MUTATION, { id, input: { description } });
}

export async function removePermissionFromRole(permissionId: string) {
  return await fetchGraphQL(REMOVE_PERMISSION_MUTATION, { permissionId });
}

export async function assignRoleToUser(userId: string, roleId: string) {
  return await fetchGraphQL(ASSIGN_ROLE_USER_MUTATION, { userId, roleId });
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  return await fetchGraphQL(REMOVE_ROLE_USER_MUTATION, { userId, roleId });
}