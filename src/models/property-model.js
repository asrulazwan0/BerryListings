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
        const propertyList = await prisma.property.findMany();

        return propertyList;
    },
    getPropertyByUuid: async (uuid) => {
        const property = await prisma.property.findUnique({
            where: { uuid: uuid },
        });

        return property;
    },
    updateProperty: async (
        property,
        {
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
        },
    ) => {
        const result = await prisma.property.update({
            where: { uuid: property.uuid },
            data: {
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
            },
        });

        return result;
    },
    deleteProperty: async (uuid) => {
        await prisma.property.delete({
            where: { uuid: uuid },
        });
    },
};

export default propertyModel;
