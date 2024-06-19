import { PrismaClient } from '@prisma/client'
import generateUniqueId from '../utils/unique-id.js';

const prisma = new PrismaClient();

const createUser = async (email) =>
{
    const user = await prisma.user.create(
    {
        data: 
        {
            uuid: generateUniqueId(),
            email: email,
            isEnabled: true,
        }
    });
        
    return user;
};

const getUserList = async () =>
{
    const userList = await prisma.user.findMany();

    return userList;
};

const getUserByUuid = async (uuid) =>
{
    const user = await prisma.user.findUnique(
    {
        where: { uuid: uuid },
    });

    return user;
};

const updateUser = async (user, { email, isEnabled }) =>
{
    user.email = email;
    user.isEnabled = isEnabled;

    const result = await prisma.user.update(
    {
        where: { uuid: user.uuid },
        data: user,
    })

    return result;
};

const deleteUser = async (uuid) =>
{
    await prisma.user.delete(
    {
        where: { uuid: uuid },
    });
};

export default 
{
    createUser,
    getUserList,
    getUserByUuid,
    updateUser,
    deleteUser
};