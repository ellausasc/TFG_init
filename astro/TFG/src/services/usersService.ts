import { fetchGraphQL } from '../api';
import { LOGIN_MUTATION, ME_QUERY, REGISTER_MUTATION, UPDATE_USER_MUTATION } from './graphql/users.queries';
import type { User, AuthPayload, UpdateUserInput, RegisterUserInput } from '../types';

export async function getMe(headers: Record<string, string> = {}): Promise<User> {
  const data = await fetchGraphQL<{ me: User }>(ME_QUERY, {}, headers);
  return data.me;
}

export async function updateMe(input: UpdateUserInput, headers: Record<string, string> = {}): Promise<User> {
  const data = await fetchGraphQL<{ updateUser: User }>(UPDATE_USER_MUTATION, { input }, headers);
  return data.updateUser;
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
