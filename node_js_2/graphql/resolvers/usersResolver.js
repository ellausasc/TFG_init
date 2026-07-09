const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require("../../db");

const JWT_SECRET = process.env.JWT_SECRET || 'XX';

const resolvers = {
  Query: {
    getAllUsers: async () => {
      return await prisma.user.findMany({
        include: { roles: true }
      });
    },
    getUserById: async (_, { id }) => {
      return await prisma.user.findUnique({ 
        where: { id: parseInt(id) },
        include: { roles: true }
      });
    },
    me: async (_, __, context) => {
      if (!context.userId) throw new Error("No estàs autenticat. Token invàlid o absent.");

      const currentUser = await prisma.user.findUnique({
        where: { id: context.userId },
        include: { roles: true }
      });

      if (!currentUser) throw new Error("L'usuari no existeix a la base de dades.");

      return currentUser;
    },
  },

  Mutation: {
    registerUser: async (_, { input }) => {
      // Validar si el usuario ya existe
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: input.email }, { dni: input.dni }],
        },
      });

      if (existingUser) {
        throw new Error("Ja existeix un usuari amb aquest email o DNI.");
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const socioCode = `SOC-${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser = await prisma.user.create({
        data: {
          code: socioCode,
          firstName: input.firstName,
          lastName1: input.lastName1,
          lastName2: input.lastName2,
          dni: input.dni,
          phone: input.phone,
          email: input.email,
          password: hashedPassword,
          birthDate: new Date(input.birthDate),
          profileImage: input.profileImage,
          roles: input.roles ? { 
            connect: input.roles.map(rolName => ({ description: rolName })) 
          } : undefined,
        },
        include: { roles: true }
      });

      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });

      return { token, user: newUser };
    },

    loginUser: async (_, { email, password }, context) => {
      const user = await prisma.user.findUnique({ 
        where: { email },
        include: { roles: {
          include: { permission: {
            include: { module: true, action: true, section: true }
          } }
        }} 
      });

      console.log("Cookie:", context.req.headers.cookie); // Debugging line

      if (!user) throw new Error("Credencials incorrectes."); 

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) throw new Error("Credencials incorrectes.");

      const permissionsSet = new Set(); // Usamos Set para evitar permisos duplicados si tiene varios roles

      user.roles.forEach(role => {
        role.permission.forEach(permission => {
          const moduleName = permission.module.name;
          const action = permission.action.action;
          
          // Formato base: "MODULO:ACCION"
          let permString = `${moduleName}:${action}`;

          // Si el permiso está atado a una sección concreta, añadimos el sectionId
          if (permission.section) {
            permString += `:${permission.section.id}`;
          }

          permissionsSet.add(permString);
        });
      });

      const userPermissions = Array.from(permissionsSet);

      console.log("User Permissions:", userPermissions); // Debugging line

      const token = jwt.sign({ userId: user.id, userPermissions }, JWT_SECRET, { expiresIn: '7d' });

      console.log("Generated Token:", token); // Debugging line

      context.res.cookie('token', token, { 
        httpOnly: true, 
        path: '/', sameSite: 
        'lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en ms
      }); 

      return { token, user };
    },

    updateUser: async (_, { input }, context) => {
      if (!context.userId) throw new Error("No estàs autenticat.");

      // Validar si el nuevo email o DNI ya está en uso por otra cuenta
      if (input.email || input.dni) {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              input.email ? { email: input.email } : {},
              input.dni ? { dni: input.dni } : {}
            ],
            NOT: { id: context.userId }
          },
        });
        if (existingUser) throw new Error("Aquest correu o DNI ja està registrat per un altre usuari.");
      }

      // Preparar datos de actualización filtrando los undefined
      const dataToUpdate = {
        firstName: input.firstName,
        lastName1: input.lastName1,
        lastName2: input.lastName2,
        dni: input.dni,
        phone: input.phone,
        email: input.email,
        birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
        profileImage: input.profileImage,
      };

      // Eliminar campos no proporcionados (undefined) para no sobrescribir con null
      Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

      return await prisma.user.update({
        where: { id: context.userId },
        data: dataToUpdate,
        include: { roles: true }
      });
    },

    changePassword: async (_, { oldPassword, newPassword }, context) => {
      if (!context.userId) throw new Error("No estàs autenticat.");

      const user = await prisma.user.findUnique({ where: { id: context.userId } });
      if (!user) throw new Error("Usuari no trobat.");

      const isValidPassword = await bcrypt.compare(oldPassword, user.password);
      if (!isValidPassword) throw new Error("La contrasenya actual és incorrecta.");

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: context.userId },
        data: { password: hashedNewPassword },
      });

      return true;
    },
  },
};

module.exports = resolvers;