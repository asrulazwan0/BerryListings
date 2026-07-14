import { validationResult } from 'express-validator';
import propertyService from '../services/property-service.js';

const propertyController = {
    createProperty: async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await propertyService.createProperty(req.body, req.user.id);

            if (result.error === 'forbidden') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            res.status(201).json({ message: 'Property created successfully', data: result.data });
        } catch (error) {
            console.error(error.stack);
            res.status(500).json({ error: 'Error creating property' });
        }
    },
    getPropertyList: async (req, res) => {
        try {
            const propertyList = await propertyService.getPropertyList();
            res.json({ message: 'get property list', data: propertyList });
        } catch (error) {
            console.error(error.stack);
            res.status(500).json({ error: 'Error fetching property list' });
        }
    },
    getPropertyById: async (req, res) => {
        const { id } = req.params;

        try {
            const property = await propertyService.getPropertyByUuid(id);

            if (!property) {
                return res.status(404).json({ message: 'Property not found' });
            }

            res.json({ message: `get property id ${id}`, data: property });
        } catch (error) {
            console.error(error.stack);
            res.status(500).json({ error: `Error fetching property id ${id}` });
        }
    },
    updateProperty: async (req, res) => {
        const { id } = req.params;

        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await propertyService.updateProperty(id, req.body);

            if (!result) {
                return res.status(404).json({ message: 'Property not found' });
            }

            res.json({ message: `Property with id ${id} updated successfully`, data: result });
        } catch (error) {
            console.error(error.stack);
            res.status(500).json({ error: `Error updating property id ${id}` });
        }
    },
    deleteProperty: async (req, res) => {
        const { id } = req.params;

        try {
            const result = await propertyService.deleteProperty(id);

            if (!result) {
                return res.status(404).json({ message: 'Property not found' });
            }

            res.status(204).send();
        } catch (error) {
            console.error(error.stack);
            res.status(500).json({ error: `Error deleting property id ${id}` });
        }
    },
};

export default propertyController;
