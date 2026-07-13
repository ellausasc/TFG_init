export const ME_QUERY = `
  query GetMe {
    me {
      firstName lastName1 lastName2 dni phone email birthDate profileImage
    }
  }
`;

export const UPDATE_USER_MUTATION = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      firstName lastName1 lastName2 phone birthDate
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        firstName
      }
    }
  }
`;

export const REGISTER_MUTATION = `
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