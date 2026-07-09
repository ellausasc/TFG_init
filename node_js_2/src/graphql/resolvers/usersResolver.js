const usersService = require('../../services/usersService');

const resolvers = {
  Query: {
    getAllUsers: async () => {
      return await usersService.getAllUsers();
    },
    getUserById: async (_, { id }) => {
      return await usersService.getUserById(id);
    },
    me: async (_, __, context) => {
      return await usersService.getMe(context.userId);
    },
  },

  Mutation: {
    registerUser: async (_, { input }) => {
      return await usersService.registerUser(input);
    },

    loginUser: async (_, { email, password }, context) => {
      const result = await usersService.loginUser(email, password);

      // El Resolver se encarga de la manipulación HTTP (Setear Cookie)
      context.res.cookie('token', result.token, { 
        httpOnly: true, 
        path: '/', 
        sameSite: 'lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en ms
      }); 

      return result;
    },

    updateUser: async (_, { id, input }, context) => {
      // Pasamos el 'id' (si viene en los argumentos) y el 'context.userId' (del token actual)
      return await usersService.updateUser(id, input, context.userId);
    },

    changePassword: async (_, { oldPassword, newPassword }, context) => {
      return await usersService.changePassword(context.userId, oldPassword, newPassword);
    },
  },
};

module.exports = resolvers;