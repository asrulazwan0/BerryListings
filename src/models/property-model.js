import generateUniqueId from '../unique-id.js';

const properties = [];

const propertyModel = {
    createProperty: (propertyEntity) =>
    {
        propertyEntity.id = generateUniqueId();
        properties.push(propertyEntity);

        return propertyEntity;
    },
    getPropertyList: () =>
    {
        return properties;
    },
    getPropertyById: (propertyId) =>
    {
        return properties.find((prop) => prop.id === propertyId);
    },
    updateProperty: (property, newValue) =>
    {
        property.title = newValue.title;
        property.description = newValue.description;
        property.price = newValue.price;
    },
    deleteProperty: (property) =>
    {
        const indexToRemove = properties.findIndex((prop) => prop.id === property.id);
        if (indexToRemove !== -1) 
        {
            properties.splice(indexToRemove, 1);
        }
    },
}

export default propertyModel