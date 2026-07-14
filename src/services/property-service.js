import propertyModel from '../models/property-model.js';
import userModel from '../models/user.model.js';

const toPropertyData = ({
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
}) => ({
    title,
    description,
    price: parseFloat(price),
    type,
    status,
    addressLine,
    city,
    bedrooms: parseInt(bedrooms, 10),
    bathrooms: parseFloat(bathrooms),
    sqft: parseInt(sqft, 10),
    lotSizeAcres:
        lotSizeAcres === undefined || lotSizeAcres === null || lotSizeAcres === ''
            ? null
            : parseFloat(lotSizeAcres),
    yearBuilt:
        yearBuilt === undefined || yearBuilt === null || yearBuilt === ''
            ? null
            : parseInt(yearBuilt, 10),
    amenities,
});

const getEnabledActor = async (actorId) => {
    const id = Number(actorId);
    if (!Number.isInteger(id)) return null;

    const actor = await userModel.getUserById(id);
    return actor?.isEnabled ? actor : null;
};

const toPhotos = (photos) => photos?.map((url, position) => ({ url: url.trim(), position }));

const propertyService = {
    createProperty: async (payload, actorId) => {
        const actor = await getEnabledActor(actorId);

        if (!actor) {
            return { error: 'forbidden' };
        }

        const data = await propertyModel.createProperty({
            ...toPropertyData(payload),
            agentId: actor.id,
            photos: toPhotos(payload.photos),
        });

        return { data };
    },
    getPropertyList: async () => {
        return propertyModel.getPropertyList();
    },
    getPropertyByUuid: async (uuid) => {
        return propertyModel.getPropertyByUuid(uuid);
    },
    updateProperty: async (uuid, payload) => {
        const property = await propertyModel.getPropertyByUuid(uuid);

        if (!property) {
            return null;
        }

        return propertyModel.updateProperty(property, toPropertyData(payload));
    },
    deleteProperty: async (uuid) => {
        const property = await propertyModel.getPropertyByUuid(uuid);

        if (!property) {
            return null;
        }

        await propertyModel.deleteProperty(property.uuid);

        return true;
    },
};

export default propertyService;
