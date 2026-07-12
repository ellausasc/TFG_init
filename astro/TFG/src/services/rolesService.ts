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
import type { Role, Module, Action, Section, User, RolePermission, AddPermissionToRoleInput } from "../types";

export async function getAllRolesWithPermissions(headers: Record<string, string> = {}): Promise<Role[]> {
  const data = await fetchGraphQL<{ getAllRoles: Role[] }>(GET_ALL_ROLES_WITH_PERMISSIONS, {}, headers);
  return data.getAllRoles || [];
}

export async function getModulesAndActions(headers: Record<string, string> = {}): Promise<{ modules: Module[], actions: Action[] }> {
  const data = await fetchGraphQL<{ getAllModules: Module[], getAllActions: Action[] }>(GET_MODULES_AND_ACTIONS, {}, headers);
  return { modules: data.getAllModules || [], actions: data.getAllActions || [] };
}

export async function getRoleFormData(headers: Record<string, string> = {}): Promise<{ modules: Module[], actions: Action[], sections: Section[] }> {
  const data = await fetchGraphQL<{ getAllModules: Module[], getAllActions: Action[], getAllSections: Section[] }>(GET_ROLE_FORM_DATA, {}, headers);
  return {
    modules: data.getAllModules || [],
    actions: data.getAllActions || [],
    sections: data.getAllSections || []
  };
}

export async function createRole(description: string): Promise<Role> {
  const data = await fetchGraphQL<{ createRole: Role }>(CREATE_ROLE_MUTATION, { input: { description } });
  return data.createRole;
}

export async function addPermissionToRole(input: AddPermissionToRoleInput): Promise<RolePermission> {
  const data = await fetchGraphQL<{ addPermissionToRole: RolePermission }>(ADD_PERMISSION_MUTATION, { input });
  return data.addPermissionToRole;
}

export async function getRoleById(id: string, headers: Record<string, string> = {}): Promise<Role | null> {
  const data = await fetchGraphQL<{ getRoleById: Role }>(GET_ROLE_BY_ID, { id }, headers);
  return data.getRoleById;
}

export async function getAllUsersBasic(headers: Record<string, string> = {}): Promise<User[]> {
  const data = await fetchGraphQL<{ getAllUsers: User[] }>(GET_ALL_USERS_BASIC, {}, headers);
  return data.getAllUsers || [];
}

export async function updateRole(id: string, description: string): Promise<Role> {
  const data = await fetchGraphQL<{ updateRole: Role }>(UPDATE_ROLE_MUTATION, { id, input: { description } });
  return data.updateRole;
}

export async function removePermissionFromRole(permissionId: string): Promise<boolean> {
  const data = await fetchGraphQL<{ removePermissionFromRole: boolean }>(REMOVE_PERMISSION_MUTATION, { permissionId });
  return data.removePermissionFromRole;
}

export async function assignRoleToUser(userId: string, roleId: string): Promise<boolean> {
  const data = await fetchGraphQL<{ assignRoleToUser: boolean }>(ASSIGN_ROLE_USER_MUTATION, { userId, roleId });
  return data.assignRoleToUser;
}

export async function removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
  const data = await fetchGraphQL<{ removeRoleFromUser: boolean }>(REMOVE_ROLE_USER_MUTATION, { userId, roleId });
  return data.removeRoleFromUser;
}