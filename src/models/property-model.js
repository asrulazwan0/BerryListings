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
    getPropertyList: async (filters = {}) => {
        const where = {};
        if (filters.type) where.type = filters.type;
        if (filters.status) where.status = filters.status;
        if (filters.city) where.city = { contains: filters.city };
        if (filters.minPrice || filters.maxPrice) {
            where.price = {};
            if (filters.minPrice) where.price.gte = Number(filters.minPrice);
            if (filters.maxPrice) where.price.lte = Number(filters.maxPrice);
        }
        if (filters.bedrooms) where.bedrooms = Number(filters.bedrooms);
        if (filters.bathrooms) where.bathrooms = Number(filters.bathrooms);

        return prisma.property.findMany({
            where,
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
