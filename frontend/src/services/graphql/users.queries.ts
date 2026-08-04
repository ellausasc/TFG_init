export const ME_QUERY = `
  query GetMe {
    me {
      firstName lastName1 lastName2 dni phone email birthDate profileImage
    }
  }
`;

export const GET_ALL_USERS_QUERY = `
  query GetAllUsersAdmin {
    getAllUsers {
      id code firstName lastName1 lastName2 email dni phone createdAt deletedAt
      roles { id description }
    }
  }
`;

export const GET_USER_BY_ID_QUERY = `
  query GetUserByIdAdmin($id: ID!) {
    getUserById(id: $id) {
      id code firstName lastName1 lastName2 email dni phone birthDate createdAt deletedAt
      roles { id description }
    }
  }
`;

export const ADMIN_UPDATE_USER_MUTATION = `
  mutation AdminUpdateUser($id: ID, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id firstName lastName1 email
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

export const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
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