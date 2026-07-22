const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usersRepository = require('../repositories/usersRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'XX';

const getAllUsers = async () => await usersRepository.findAll();
const getUserById = async (id) => await usersRepository.findById(parseInt(id, 10));

const getMe = async (userId) => {
  if (!userId) throw new Error("No estàs autenticat. Token invàlid o absent.");
  const currentUser = await usersRepository.findById(userId);
  if (!currentUser) throw new Error("L'usuari no existeix a la base de dades.");
  return currentUser;
};

// L'User de Prisma no te un camp escalar "profileImage": la imatge de perfil
// es guarda com un registre de la relacio 1:1 `profileDocument`, amb
// usage: PROFILE_IMAGE. Aquesta funcio construeix aquest registre a partir de
// la URL rebuda de GraphQL.
const buildProfileImageDocument = (url) => ({
  name: 'Imatge de perfil',
  url,
  type: 'image',
  usage: 'PROFILE_IMAGE',
});

const registerUser = async (input) => {
  const existingUser = await usersRepository.findByEmailOrDni(input.email, input.dni);
  if (existingUser) throw new Error("Ja existeix un usuari amb aquest email o DNI.");

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const socioCode = `SOC-${Math.floor(1000 + Math.random() * 9000)}`;

  const dataToCreate = {
    code: socioCode,
    firstName: input.firstName,
    lastName1: input.lastName1,
    lastName2: input.lastName2,
    dni: input.dni,
    phone: input.phone,
    email: input.email,
    password: hashedPassword,
    birthDate: new Date(input.birthDate),
    profileDocument: input.profileImage
      ? { create: buildProfileImageDocument(input.profileImage) }
      : undefined,
    roles: input.roles ? { connect: input.roles.map(rolName => ({ description: rolName })) } : undefined,
  };

  const newUser = await usersRepository.create(dataToCreate);
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });
  return { token, user: newUser };
};

// Construeix la llista de cadenes de permisos (MODUL:ACCIO[:idSeccio]) a partir
// dels rols d'un usuari carregat amb `roles.permission.module/action/section`
const buildPermissionsList = (user) => {
  const permissionsSet = new Set();
  user.roles.forEach(role => {
    role.permission.forEach(permission => {
      const moduleName = permission.module.name;
      const action = permission.action.action;
      let permString = `${moduleName}:${action}`;
      if (permission.section) permString += `:${permission.section.id}`;
      permissionsSet.add(permString);
    });
  });
  return Array.from(permissionsSet);
};

const getUserPermissions = async (userId) => {
  if (!userId) return [];
  const user = await usersRepository.findByIdWithPermissions(userId);
  if (!user) return [];
  return buildPermissionsList(user);
};

const loginUser = async (email, password) => {
  const user = await usersRepository.findByEmailWithPermissions(email);
  if (!user) throw new Error("Credencials incorrectes."); 

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error("Credencials incorrectes.");

  const userPermissions = buildPermissionsList(user);
  const token = jwt.sign({ userId: user.id, userPermissions }, JWT_SECRET, { expiresIn: '7d' });
  
  return { token, user };
};

const updateUser = async (id, input, currentUserId) => {
  const targetUserId = id ? parseInt(id, 10) : currentUserId;
  if (!targetUserId) throw new Error("No s'ha pogut determinar l'usuari a actualitzar.");

  if (input.email || input.dni) {
    const existingUser = await usersRepository.findByEmailOrDniExceptId(input.email, input.dni, targetUserId);
    if (existingUser) throw new Error("Aquest correu o DNI ja està registrat per un altre usuari.");
  }

  const dataToUpdate = {
    firstName: input.firstName,
    lastName1: input.lastName1,
    lastName2: input.lastName2,
    dni: input.dni,
    phone: input.phone,
    email: input.email,
    birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
  };

  Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

  // profileImage no es un camp escalar: si ve a l'input, creem o actualitzem
  // el document d'usage PROFILE_IMAGE (o l'esborrem si s'envia buit/null)
  if (input.profileImage !== undefined) {
    dataToUpdate.profileDocument = input.profileImage
      ? {
          upsert: {
            create: buildProfileImageDocument(input.profileImage),
            update: buildProfileImageDocument(input.profileImage),
          }
        }
      : { disconnect: true };
  }

  return await usersRepository.update(targetUserId, dataToUpdate);
};

const changePassword = async (userId, oldPassword, newPassword) => {
  if (!userId) throw new Error("No estàs autenticat.");
  const user = await usersRepository.findById(userId);
  if (!user) throw new Error("Usuari no trobat.");

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) throw new Error("La contrasenya actual és incorrecta.");

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await usersRepository.update(userId, { password: hashedNewPassword });
  return true;
};

module.exports = { getAllUsers, getUserById, getMe, registerUser, loginUser, updateUser, changePassword, getUserPermissions };