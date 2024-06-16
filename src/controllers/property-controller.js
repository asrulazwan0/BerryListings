import propertyModel from '../models/property-model.js';

const propertyController = {
    createProperty: async (req, res) =>
    {
        try 
        {
            const { title, description, price } = req.body;
            const numericPrice = parseFloat(price);
        
            const result = await propertyModel.createProperty({ title, description, price: numericPrice });
        
            res.status(201).json({ message: 'Property created successfully', data: result });
        } 
        catch (error) 
        {
            res.status(500).json({ error: 'Error creating property' });
        }
    },
    getPropertyList: async (req, res) =>
    {
        const propertyList = await propertyModel.getPropertyList();
        res.json({ message: 'get property list', data: propertyList });
    },
    getPropertyById: async (req, res) =>
    {
        const { id } = req.params;
        const property = await propertyModel.getPropertyByUuid(id);
    
        if (!property) 
        {
            return res.status(404).json({ message: 'Property not found' });
        }
    
        res.json({ message: `get property id ${id}`, data: property });
    },
    updateProperty: async (req, res) => 
    {
        const { id } = req.params;

        try 
        {
            const { title, description, price } = req.body;
            const numericPrice = parseFloat(price);
            const property = await propertyModel.getPropertyByUuid(id);
        
            if (!property) 
            {
                return res.status(404).json({ message: 'Property not found' });
            }

            const result = await propertyModel.updateProperty(property, { title, description, price: numericPrice });

            res.json({ message: `Property with id ${id} updated successfully`, data: result });
        }
        catch (error) 
        {
            console.log(error)
            res.status(500).json({ error: `Error updating property id ${id}` });
        }
    },
    deleteProperty: async (req, res) => 
    {
        const { id } = req.params;

        try 
        {
            const property = await propertyModel.getPropertyByUuid(id);
        
            if (!property) 
            {
                return res.status(404).json({ message: 'Property not found' });
            }

            await propertyModel.deleteProperty(property.uuid);

            res.status(204).send();} 
        catch (error) 
        {
            res.status(500).json({ error: `Error deleting property id ${id}` });
        }
    },
}

export default propertyController