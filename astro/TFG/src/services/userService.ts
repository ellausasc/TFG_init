import { fetchGraphQL } from '../api';
import { LOGIN_MUTATION, ME_QUERY, REGISTER_MUTATION, UPDATE_USER_MUTATION } from './graphql/users.queries';

export interface User {
  id?: string;
  firstName: string;
  lastName1?: string;
  lastName2?: string;
  dni?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  profileImage?: string;
}

export async function getMe(headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<{ me: User }>(ME_QUERY, {}, headers);
  return data.me;
}

export async function updateMe(input: any, headers: Record<string, string> = {}) {
  const data = await fetchGraphQL<{ updateUser: User }>(UPDATE_USER_MUTATION, { input }, headers);
  return data.updateUser;
}

export async function login(email: string, password: string) {
  const data = await fetchGraphQL<{ loginUser: { token: string, user: { firstName: string } } }>(
    LOGIN_MUTATION, 
    { email, password }
  );
  return data.loginUser;
}

export async function registerUser(input: any) {
  const data = await fetchGraphQL<{ registerUser: { token: string; user: any } }>(
    REGISTER_MUTATION, 
    { input }
  );
  return data.registerUser;
}