const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || 'XX';

const getAllUsers = async () => {
  return await prisma.user.findMany({
    include: { roles: true }
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({ 
    where: { id: parseInt(id) },
    include: { roles: true }
  });
};

const getMe = async (userId) => {
  if (!userId) throw new Error("No estàs autenticat. Token invàlid o absent.");

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true }
  });

  if (!currentUser) throw new Error("L'usuari no existeix a la base de dades.");

  return currentUser;
};

const registerUser = async (input) => {
  // 1. Validar si el usuario ya existe
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { dni: input.dni }],
    },
  });

  if (existingUser) {
    throw new Error("Ja existeix un usuari amb aquest email o DNI.");
  }

  // 2. Hashear password y generar código
  const hashedPassword = await bcrypt.hash(input.password, 10);
  const socioCode = `SOC-${Math.floor(1000 + Math.random() * 9000)}`;

  // 3. Crear usuario
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

  // 4. Generar token
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });

  return { token, user: newUser };
};

const loginUser = async (email, password) => {
  // 1. Buscar usuario con todos sus permisos anidados
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { 
      roles: {
        include: { 
          permission: {
            include: { module: true, action: true, section: true }
          } 
        }
      }
    } 
  });

  if (!user) throw new Error("Credencials incorrectes."); 

  // 2. Validar contraseña
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error("Credencials incorrectes.");

  // 3. Aplanar permisos evitando duplicados con un Set
  const permissionsSet = new Set(); 

  user.roles.forEach(role => {
    role.permission.forEach(permission => {
      const moduleName = permission.module.name;
      const action = permission.action.action;
      
      let permString = `${moduleName}:${action}`;
      if (permission.section) {
        permString += `:${permission.section.id}`;
      }

      permissionsSet.add(permString);
    });
  });

  const userPermissions = Array.from(permissionsSet);

  // 4. Generar JWT
  const token = jwt.sign({ userId: user.id, userPermissions }, JWT_SECRET, { expiresIn: '7d' });

  return { token, user };
};

const updateUser = async (id, input, currentUserId) => {
  // Determinamos a quién actualizar: si pasan 'id' explícito, se usa ese (admin actualizando a otro),
  // si no, asume que el usuario se está actualizando a sí mismo (currentUserId)
  const targetUserId = id ? parseInt(id) : currentUserId;

  if (!targetUserId) {
    throw new Error("No s'ha pogut determinar l'usuari a actualitzar.");
  }

  // Validar si el nuevo email o DNI ya está en uso por OTRA cuenta
  if (input.email || input.dni) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          input.email ? { email: input.email } : {},
          input.dni ? { dni: input.dni } : {}
        ],
        NOT: { id: targetUserId }
      },
    });
    if (existingUser) throw new Error("Aquest correu o DNI ja està registrat per un altre usuari.");
  }

  // Preparar datos filtrando undefined (evitando sobrescribir con null)
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

  Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

  return await prisma.user.update({
    where: { id: targetUserId },
    data: dataToUpdate,
    include: { roles: true }
  });
};

const changePassword = async (userId, oldPassword, newPassword) => {
  if (!userId) throw new Error("No estàs autenticat.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuari no trobat.");

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) throw new Error("La contrasenya actual és incorrecta.");

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return true;
};

module.exports = {
  getAllUsers,
  getUserById,
  getMe,
  registerUser,
  loginUser,
  updateUser,
  changePassword
};