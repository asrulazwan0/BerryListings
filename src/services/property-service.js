import propertyModel from '../models/property-model.js';

const propertyService = {
    createProperty: async ({ title, description, price }) =>
    {
        const numericPrice = parseFloat(price);

        return propertyModel.createProperty({ title, description, price: numericPrice });
    },
    getPropertyList: async () =>
    {
        return propertyModel.getPropertyList();
    },
    getPropertyByUuid: async (uuid) =>
    {
        return propertyModel.getPropertyByUuid(uuid);
    },
    updateProperty: async (uuid, { title, description, price }) =>
    {
        const property = await propertyModel.getPropertyByUuid(uuid);

        if (!property)
        {
            return null;
        }

        const numericPrice = parseFloat(price);

        return propertyModel.updateProperty(property, { title, description, price: numericPrice });
    },
    deleteProperty: async (uuid) =>
    {
        const property = await propertyModel.getPropertyByUuid(uuid);

        if (!property)
        {
            return null;
        }

        await propertyModel.deleteProperty(property.uuid);

        return true;
    },
}

export default propertyService
