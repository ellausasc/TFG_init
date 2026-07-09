export const GET_ALL_ROLES_WITH_PERMISSIONS = `
  query GetAllRolesWithPermissions {
    getAllRoles {
      id
      description
      permission {
        id
        module { name }
        action { action description }
        section { name }
      }
    }
  }
`;

export const GET_MODULES_AND_ACTIONS = `
  query GetModulesAndActions {
    getAllModules { id name description }
    getAllActions { id action description }
  }
`;

// Añade esto en tu archivo de queries (ej. graphql/permissions.queries.ts)

export const CREATE_ROLE_MUTATION = `
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      id
      description
    }
  }
`;

export const GET_ROLE_FORM_DATA = `
  query GetRoleFormData {
    getAllModules { id name description }
    getAllActions { id action description }
    getAllSections { id name } 
  }
`;

export const ADD_PERMISSION_MUTATION = `
  mutation AddPermissionToRole($input: AddPermissionToRoleInput!) {
    addPermissionToRole(input: $input) {
      id
    }
  }
`;

export const GET_ROLE_BY_ID = `
  query GetRoleById($id: ID!) {
    getRoleById(id: $id) {
      id
      description
      users {
        id
        firstName
        lastName1
        email
      }
      permission {
        id
        module { id name }
        action { id action description }
        section { id name }
      }
    }
  }
`;

// Suposant que tens una query per obtenir tots els usuaris
export const GET_ALL_USERS_BASIC = `
  query GetAllUsers {
    getAllUsers { id firstName lastName1 email }
  }
`;

export const UPDATE_ROLE_MUTATION = `
  mutation UpdateRole($id: ID!, $input: UpdateRoleInput!) {
    updateRole(id: $id, input: $input) { id }
  }
`;

export const REMOVE_PERMISSION_MUTATION = `
  mutation RemovePermissionFromRole($permissionId: ID!) {
    removePermissionFromRole(permissionId: $permissionId)
  }
`;

export const ASSIGN_ROLE_USER_MUTATION = `
  mutation AssignRoleToUser($userId: ID!, $roleId: ID!) {
    assignRoleToUser(userId: $userId, roleId: $roleId)
  }
`;

export const REMOVE_ROLE_USER_MUTATION = `
  mutation RemoveRoleFromUser($userId: ID!, $roleId: ID!) {
    removeRoleFromUser(userId: $userId, roleId: $roleId)
  }
`;