const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

// src/api.ts
export async function fetchGraphQL<T>(
  query: string, 
  variables = {}, 
  headers: Record<string, string> = {} // Recibiremos la cookie a través de este parámetro
): Promise<T> {

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    credentials: "include",
    headers: { 
      "Content-Type": "application/json",
      ...headers // Aquí se inyectará "Cookie": "token=..." si viene desde el .astro
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error("---  ERROR DE GRAPHQL RECIBIDO DEL BACKEND ---");
    console.error(JSON.stringify(result.errors, null, 2));
    throw new Error(`Error del Servidor GraphQL: ${result.errors[0].message}`);
  }

  return result.data;
}