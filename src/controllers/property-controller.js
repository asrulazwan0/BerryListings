import propertyModel from '../utils/models/property-model.js';

const propertyController = {
    createProperty: (req, res) =>
    {
        try 
        {
            const { title, description, price } = req.body;
        
            // Validate the data (optional step)
        
            const property = propertyModel.createProperty({ title, description, price });
        
            res.status(201).json({ message: 'Property created successfully', data: property });
        } 
        catch (error) 
        {
            res.status(500).json({ error: 'Error creating property' });
        }
    },
    getPropertyList: (req, res) =>
    {
        const propertyList = propertyModel.getPropertyList();
        res.json({ message: 'get property list', data: propertyList });
    },
    getPropertyById: (req, res) =>
    {
        const propertyId = req.params.id;
        const property = propertyModel.getPropertyById(propertyId);
    
        if (!property) 
        {
            return res.status(404).json({ message: 'Property not found' });
        }
    
        res.json({ message: `get property id ${propertyId}`, data: property });
    },
    updateProperty: (req, res) => 
    {
        const newValue = req.body;
        const propertyId = req.params.id;
        const property = propertyModel.getPropertyById(propertyId);
    
        if (!property) 
        {
            return res.status(404).json({ message: 'Property not found' });
        }

        propertyModel.updateProperty(property, newValue);

        res.json({ message: `Property with id ${propertyId} updated successfully` });
    },
    deleteProperty: (req, res) => 
    {
        const propertyId = req.params.id;
        const property = propertyModel.getPropertyById(propertyId);
    
        if (!property) 
        {
            return res.status(404).json({ message: 'Property not found' });
        }

        propertyModel.deleteProperty(property);

        res.json({ message: `Property with id ${propertyId} deleted successfully` });
    },
}

export default propertyController