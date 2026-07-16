import propertyModel from '../models/property-model.js';
import userModel from '../models/user.model.js';

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const toPropertyData = (payload) => {
    const data = {
        title: payload.title.trim(),
        description: payload.description.trim(),
        price: Number.parseFloat(payload.price),
        addressLine: payload.addressLine.trim(),
        city: payload.city.trim(),
        bedrooms: Number.parseInt(payload.bedrooms, 10),
        bathrooms: Number.parseFloat(payload.bathrooms),
        sqft: Number.parseInt(payload.sqft, 10),
    };

    if (hasOwn(payload, 'type')) data.type = payload.type;
    if (hasOwn(payload, 'status')) data.status = payload.status;
    if (hasOwn(payload, 'lotSizeAcres')) {
        data.lotSizeAcres =
            payload.lotSizeAcres === null || payload.lotSizeAcres === ''
                ? null
                : Number.parseFloat(payload.lotSizeAcres);
    }
    if (hasOwn(payload, 'yearBuilt')) {
        data.yearBuilt =
            payload.yearBuilt === null || payload.yearBuilt === ''
                ? null
                : Number.parseInt(payload.yearBuilt, 10);
    }
    if (hasOwn(payload, 'amenities')) {
        data.amenities = payload.amenities.map((amenity) => amenity.trim());
    }

    return data;
};

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
    getPropertyList: async (filters) => {
        return propertyModel.getPropertyList(filters);
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
