import { PrismaClient } from '@prisma/client'
import generateUniqueId from '../utils/unique-id.js';

const prisma = new PrismaClient();

const propertyModel = {
    createProperty: async ({ title, description, price }) =>
    {
        const property = await prisma.property.create({
            data: {
                uuid: generateUniqueId(),
                title,
                description,
                price,
            }
        });
          
        return property;
    },
    getPropertyList: async () =>
    {
        const propertyList = await prisma.property.findMany();

        return propertyList;
    },
    getPropertyByUuid: async (uuid) =>
    {
        const property = await prisma.property.findUnique({
            where: { uuid: uuid },
        });

        return property;
    },
    updateProperty: async (property, { title, description, price }) =>
    {
        property.title = title;
        property.description = description;
        property.price = price;

        const result = await prisma.property.update({
            where: { uuid: property.uuid },
            data: property,
        })

        return result;
    },
    deleteProperty: async (uuid) =>
    {
        await prisma.property.delete({
            where: { uuid: uuid },
        });
    },
}

export default propertyModel