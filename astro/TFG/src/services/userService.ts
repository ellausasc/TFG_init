// src/services/userService.ts
const GRAPHQL_URL = "http://localhost:4000/graphql";

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

// Función privada para peticiones autenticadas
async function fetchAuth(query: string, variables = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in.");

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

export async function getMe() {
  const data = await fetchAuth(ME_QUERY);
  return data.me;
}

export async function updateMe(input: any) {
  const data = await fetchAuth(UPDATE_USER_MUTATION, { input });
  return data.updateUser;
}