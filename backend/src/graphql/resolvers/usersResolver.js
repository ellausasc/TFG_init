const usersService = require('../../services/usersService');

// L'User de Prisma no te un camp escalar "profileImage": es guarda com un
// document relacionat (usage: PROFILE_IMAGE). Aqui es reconstrueix el camp
// pla que espera l'esquema GraphQL.
const formatUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    profileImage: user.profileDocument ? user.profileDocument.url : null,
  };
};

const resolvers = {
  Query: {
    getAllUsers: async () => {
      const users = await usersService.getAllUsers();
      return users.map(formatUser);
    },
    getUserById: async (_, { id }) => {
      const user = await usersService.getUserById(id);
      return formatUser(user);
    },
    me: async (_, __, context) => {
      const user = await usersService.getMe(context.userId);
      return formatUser(user);
    },
  },

  Mutation: {
    registerUser: async (_, { input }) => {
      const result = await usersService.registerUser(input);
      return { ...result, user: formatUser(result.user) };
    },

    loginUser: async (_, { email, password }, context) => {
      const result = await usersService.loginUser(email, password);

      // El resolver s'encarrega de la manipulacio HTTP (establir la galeta)
      context.res.cookie('token', result.token, { 
        httpOnly: true, 
        path: '/', 
        sameSite: 'lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dies en ms
      }); 

      return { ...result, user: formatUser(result.user) };
    },

    updateUser: async (_, { id, input }, context) => {
      // Passem l'id (si ve als arguments) i el context.userId (del token actual)
      const user = await usersService.updateUser(id, input, context.userId);
      return formatUser(user);
    },

    changePassword: async (_, { oldPassword, newPassword }, context) => {
      return await usersService.changePassword(context.userId, oldPassword, newPassword);
    },
  },
};

module.exports = resolvers;