import { fetchGraphQL } from "../api";

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        firstName
      }
    }
  }
`;

export async function login(email: string, password: string) {
  // Al no necesitar token todavía, usamos la función genérica fetchGraphQL
  const data = await fetchGraphQL<{ loginUser: { token: string, user: { firstName: string } } }>(
    LOGIN_MUTATION, 
    { email, password }
  );
  
  return data.loginUser;
}