// src/services/userService.ts
import { fetchGraphQL } from '../api';

// Definción de tipo de datos
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

interface GetMeResponse {
  me: User;
}

interface UpdateUserResponse {
  updateUser: User;
}

interface RegisterResponse {
  registerUser: {
    token: string;
    user: User;
  };
}

// Queries y Mutations
const ME_QUERY = `
  query GetMe {
    me {
      firstName
      lastName1
      lastName2
      dni
      phone
      email
      birthDate
      profileImage
    }
  }
`;

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      firstName
      lastName1
      lastName2
      phone
      birthDate
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($input: RegisterUserInput!) {
    registerUser(input: $input) {
      token
      user {
        id
        firstName
        email
      }
    }
  }
`;

// Función auxiliar para inyectar el token en las peticiones privadas
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in.");
  
  return { "Authorization": `Bearer ${token}` };
}

export async function getMe() {
  const data = await fetchGraphQL<GetMeResponse>(ME_QUERY, {}, getAuthHeaders());
  return data.me;
}

export async function updateMe(input: any) {
  const data = await fetchGraphQL<UpdateUserResponse>(UPDATE_USER_MUTATION, { input }, getAuthHeaders());
  return data.updateUser;
}

export async function registerUser(input: any) {
  const data = await fetchGraphQL<RegisterResponse>(REGISTER_MUTATION, { input }, {});
  return data.registerUser;
}