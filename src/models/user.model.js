import { PrismaClient } from '@prisma/client';
import generateUniqueId from '../utils/unique-id.js';

const prisma = new PrismaClient();

const createUser = async (email, role = 'USER') => {
    const user = await prisma.user.create({
        data: {
            uuid: generateUniqueId(),
            email: email,
            isEnabled: true,
            role: role,
        },
    });
    return user;
};

const getUserList = async () => {
    const userList = await prisma.user.findMany();

    return userList;
};

const getUserByUuid = async (uuid) => {
    const user = await prisma.user.findUnique({
        where: { uuid: uuid },
    });

    return user;
};

const getUserById = async (id) => {
    return prisma.user.findUnique({ where: { id } });
};

const getUserByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    return user;
};

const updateUser = async (user, { email, isEnabled, role }) => {
    if (email !== undefined) user.email = email;
    if (isEnabled !== undefined) user.isEnabled = isEnabled;
    if (role !== undefined) user.role = role;

    const result = await prisma.user.update({
        where: { uuid: user.uuid },
        data: user,
    });

    return result;
};

const deleteUser = async (uuid) => {
    await prisma.user.delete({
        where: { uuid: uuid },
    });
};

const countEnabledAdmins = async () => {
    return prisma.user.count({ where: { role: 'ADMIN', isEnabled: true } });
};

export default {
    createUser,
    getUserList,
    getUserById,
    getUserByUuid,
    getUserByEmail,
    updateUser,
    deleteUser,
    countEnabledAdmins,
};
