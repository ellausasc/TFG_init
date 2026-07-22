// src/api.ts

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql";

class GraphQLClient {
  private static instance: GraphQLClient;
  private defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  private constructor() {}

  public static getInstance(): GraphQLClient {
    if (!GraphQLClient.instance) {
      GraphQLClient.instance = new GraphQLClient();
    }
    return GraphQLClient.instance;
  }

  /**
   * Sets default headers for all subsequent requests.
   * Useful for setting the cookie header globally during SSR.
   */
  public setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  public async request<T>(
    query: string,
    variables: Record<string, any> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T> {

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: {
        ...this.defaultHeaders,
        ...customHeaders,
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("--- ERROR DE GRAPHQL RECIBIDO DEL BACKEND ---");
      console.error(JSON.stringify(result.errors, null, 2));
      throw new Error(`Error del Servidor GraphQL: ${result.errors[0].message}`);
    }

    return result.data as T;
  }
}

export const apiClient = GraphQLClient.getInstance();

// Helper function to maintain backward compatibility with existing code structure
export async function fetchGraphQL<T>(
  query: string,
  variables = {},
  headers: Record<string, string> = {}
): Promise<T> {
  return apiClient.request<T>(query, variables, headers);
}