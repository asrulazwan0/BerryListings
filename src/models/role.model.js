import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getRoles = async () => {
  return prisma.managedRole.findMany({ orderBy: { name: 'asc' } });
};

const getRoleByName = async (name) => {
  return prisma.managedRole.findUnique({ where: { name } });
};

const upsertRole = async (name, permissions) => {
  return prisma.managedRole.upsert({
    where: { name },
    update: { permissions },
    create: { name, permissions },
  });
};

const deleteRole = async (name) => {
  return prisma.managedRole.delete({ where: { name } });
};

export default { getRoles, getRoleByName, upsertRole, deleteRole };
