import { fetchGraphQL } from '../api';
import {
  LOGIN_MUTATION, ME_QUERY, REGISTER_MUTATION, UPDATE_USER_MUTATION, CHANGE_PASSWORD_MUTATION,
  GET_ALL_USERS_QUERY, GET_USER_BY_ID_QUERY, ADMIN_UPDATE_USER_MUTATION,
} from './graphql/users.queries';

import type { User, AuthPayload, UpdateUserInput, RegisterUserInput } from '../types';

export async function getMe(headers: Record<string, string> = {}): Promise<User> {
  const data = await fetchGraphQL<{ me: User }>(ME_QUERY, {}, headers);
  return data.me;
}

export async function updateMe(input: UpdateUserInput, headers: Record<string, string> = {}): Promise<User> {
  const data = await fetchGraphQL<{ updateUser: User }>(UPDATE_USER_MUTATION, { input }, headers);
  return data.updateUser;
}

// RF-2.1 / CU-04: canvi de contrasenya de l'usuari autenticat.
export async function changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
  const data = await fetchGraphQL<{ changePassword: boolean }>(
    CHANGE_PASSWORD_MUTATION,
    { oldPassword, newPassword }
  );
  return data.changePassword;
}

export async function loginUser(email: string, password: string): Promise<AuthPayload> {
  const data = await fetchGraphQL<{ loginUser: AuthPayload }>(
    LOGIN_MUTATION, 
    { email, password }
  );
  return data.loginUser;
}

export async function registerUser(input: RegisterUserInput): Promise<AuthPayload> {
  const data = await fetchGraphQL<{ registerUser: AuthPayload }>(
    REGISTER_MUTATION, 
    { input }
  );
  return data.registerUser;
}

// --- Gestió d'usuaris (CU-13, RF-3.5) ---

export async function getAllUsers(headers: Record<string, string> = {}): Promise<User[]> {
  const data = await fetchGraphQL<{ getAllUsers: User[] }>(GET_ALL_USERS_QUERY, {}, headers);
  return data.getAllUsers || [];
}

export async function getUserById(id: string, headers: Record<string, string> = {}): Promise<User | null> {
  const data = await fetchGraphQL<{ getUserById: User }>(GET_USER_BY_ID_QUERY, { id }, headers);
  return data.getUserById;
}

export async function adminUpdateUser(id: string, input: UpdateUserInput): Promise<User> {
  const data = await fetchGraphQL<{ updateUser: User }>(ADMIN_UPDATE_USER_MUTATION, { id, input });
  return data.updateUser;
}