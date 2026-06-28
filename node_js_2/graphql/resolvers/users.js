const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require("../../db");

// Clave secreta para firmar los tokens (debería estar en tu archivo .env)
const JWT_SECRET = process.env.JWT_SECRET || 'XX';

const resolvers = {
  Query: {
    getAllUsers: async () => {
      return await prisma.user.findMany();
    },
    getUserById: async (_, { id }) => {
      return await prisma.user.findUnique({ where: { id: parseInt(id) } });
    },
    me: async (_, __, context) => {
      // 1. Verificamos si hay un ID de usuario en el contexto
      if (!context.userId) {
        throw new Error("No estàs autenticat. Token invàlid o absent.");
      }

      console.log(`Usuari autenticat amb ID: ${context.userId}`);
      // 2. Buscamos al usuario en la base de datos
      const currentUser = await prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (!currentUser) {
        throw new Error("L'usuari ja no existeix a la base de dades.");
      }

      return currentUser;
    },
  },

  Mutation: {
    // REGISTRO DE USUARIO
    registerUser: async (_, { input }) => {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: input.email }, { dni: input.dni }],
        },
      });

      if (existingUser) {
        throw new Error("Ya existe un usuario con ese email o DNI.");
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(input.password, saltRounds);

      const newUser = await prisma.user.create({
        data: {
          first_name: input.first_name,
          last_name_1: input.last_name_1,
          last_name_2: input.last_name_2,
          dni: input.dni,
          phone: input.phone,
          email: input.email,
          password: hashedPassword,
          birth_date: new Date(input.birth_date),
          roles: input.roles || ["MEMBER"],
          sections: input.sections || [],
        },
      });

      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });

      return { token, user: newUser };
    },

    loginUser: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new Error("Credenciales incorrectas."); 
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error("Credenciales incorrectas.");
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

      return { token, user };
    },

    updateUser: async (_, { input }, context) => {
      if (!context.userId) {
        throw new Error("No estàs autenticat.");
      }

      // Si el usuario intenta cambiar su email o DNI, comprobamos que no estén ya en uso por OTRA persona
      if (input.email || input.dni) {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              input.email ? { email: input.email } : {},
              input.dni ? { dni: input.dni } : {}
            ],
            NOT: { id: context.userId } // Excluimos al propio usuario de la búsqueda
          },
        });

        if (existingUser) {
          throw new Error("Aquest correu o DNI ja està registrat per un altre usuari.");
        }
      }

      // Preparamos los datos a actualizar (si envían birth_date, lo convertimos a fecha)
      const dataToUpdate = { ...input };
      if (input.birth_date) {
        dataToUpdate.birth_date = new Date(input.birth_date);
      }

      const updatedUser = await prisma.user.update({
        where: { id: context.userId },
        data: dataToUpdate,
      });

      return updatedUser;
    },

    changePassword: async (_, { oldPassword, newPassword }, context) => {
      if (!context.userId) {
        throw new Error("No estàs autenticat.");
      }

      const user = await prisma.user.findUnique({ where: { id: context.userId } });
      
      if (!user) {
        throw new Error("Usuari no trobat.");
      }

      // 1. Comprobar que la contraseña antigua es correcta
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) {
        throw new Error("La contrasenya actual és incorrecta.");
      }

      // 2. Encriptar la nueva contraseña
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // 3. Guardarla en la base de datos
      await prisma.user.update({
        where: { id: context.userId },
        data: { password: hashedNewPassword },
      });

      // Retornamos true indicando que el cambio fue exitoso
      return true;
    },
  },
};

module.exports = resolvers;