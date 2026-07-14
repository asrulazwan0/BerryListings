import { PrismaClient } from '@prisma/client';
import generateUniqueId from '../utils/unique-id.js';

const prisma = new PrismaClient();

const publicPropertySelect = {
    uuid: true,
    title: true,
    description: true,
    price: true,
    type: true,
    status: true,
    addressLine: true,
    city: true,
    bedrooms: true,
    bathrooms: true,
    sqft: true,
    lotSizeAcres: true,
    yearBuilt: true,
    amenities: true,
    createdAt: true,
    updatedAt: true,
    agent: { select: { uuid: true, email: true } },
    photos: {
        select: { url: true, position: true },
        orderBy: { position: 'asc' },
    },
};

const propertyModel = {
    createProperty: async ({
        title,
        description,
        price,
        type,
        status,
        addressLine,
        city,
        bedrooms,
        bathrooms,
        sqft,
        lotSizeAcres,
        yearBuilt,
        amenities,
        agentId,
        photos,
    }) => {
        const property = await prisma.property.create({
            data: {
                uuid: generateUniqueId(),
                title,
                description,
                price,
                type,
                status,
                addressLine,
                city,
                bedrooms,
                bathrooms,
                sqft,
                lotSizeAcres,
                yearBuilt,
                amenities,
                agentId,
                photos: photos?.length ? { create: photos } : undefined,
            },
            select: publicPropertySelect,
        });

        return property;
    },
    getPropertyList: async () => {
        return prisma.property.findMany({
            select: publicPropertySelect,
            orderBy: { createdAt: 'desc' },
        });
    },
    getPropertyByUuid: async (uuid) => {
        return prisma.property.findUnique({
            where: { uuid },
            select: publicPropertySelect,
        });
    },
    getPropertyOwnership: async (uuid) => {
        return prisma.property.findUnique({
            where: { uuid },
            select: { uuid: true, agentId: true },
        });
    },
    updateProperty: async (uuid, propertyData, photos) => {
        const photoUpdate =
            photos === undefined
                ? {}
                : {
                      photos: {
                          deleteMany: {},
                          create: photos,
                      },
                  };

        return prisma.property.update({
            where: { uuid },
            data: { ...propertyData, ...photoUpdate },
            select: publicPropertySelect,
        });
    },
    deleteProperty: async (uuid) => {
        await prisma.property.delete({
            where: { uuid: uuid },
        });
    },
};

export default propertyModel;
