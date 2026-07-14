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

const canMutate = (actor, property) => actor.role === 'ADMIN' || actor.id === property.agentId;

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
    updateProperty: async (uuid, payload, actorId) => {
        const actor = await getEnabledActor(actorId);

        if (!actor) {
            return { error: 'forbidden' };
        }

        const property = await propertyModel.getPropertyOwnership(uuid);

        if (!property) {
            return { error: 'not_found' };
        }

        if (!canMutate(actor, property)) {
            return { error: 'forbidden' };
        }

        const data = await propertyModel.updateProperty(
            property.uuid,
            toPropertyData(payload),
            toPhotos(payload.photos),
        );

        return { data };
    },
    deleteProperty: async (uuid, actorId) => {
        const actor = await getEnabledActor(actorId);

        if (!actor) {
            return { error: 'forbidden' };
        }

        const property = await propertyModel.getPropertyOwnership(uuid);

        if (!property) {
            return { error: 'not_found' };
        }

        if (!canMutate(actor, property)) {
            return { error: 'forbidden' };
        }

        await propertyModel.deleteProperty(property.uuid);

        return { data: true };
    },
};

export default propertyService;
