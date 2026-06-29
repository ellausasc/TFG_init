const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

// src/api.ts
export async function fetchGraphQL<T>(query: string, variables = {}): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  if (result.errors) {
    // ESTO es lo que necesitamos ver
    console.error("--- 🚨 ERROR DE GRAPHQL RECIBIDO DEL BACKEND ---");
    console.error(JSON.stringify(result.errors, null, 2));
    
    // Lanzamos un error que incluya el mensaje real del servidor
    throw new Error(`Error del Servidor GraphQL: ${result.errors[0].message}`);
  }

  return result.data;
}