import { describe, expect, it } from 'vitest';
import { createSwaggerSpec } from '../src/swagger.js';

describe('property OpenAPI contract', () => {
    it('documents the complete authenticated create payload', () => {
        const spec = createSwaggerSpec(3000);
        const operation = spec.paths['/api/v1/properties'].post;
        const schema = operation.requestBody.content['application/json'].schema;

        expect(operation.security).toEqual([{ bearerAuth: [] }]);
        expect(schema.required).toEqual(
            expect.arrayContaining([
                'title',
                'description',
                'price',
                'addressLine',
                'city',
                'bedrooms',
                'bathrooms',
                'sqft',
            ]),
        );
        expect(schema.required).not.toContain('agentId');
        expect(schema.properties.photos.items.format).toBe('uri');
        expect(schema.properties.amenities.items.type).toBe('string');
    });

    it('documents the complete authenticated update payload', () => {
        const spec = createSwaggerSpec(3000);
        const operation = spec.paths['/api/v1/properties/{id}'].put;
        const schema = operation.requestBody.content['application/json'].schema;

        expect(operation.security).toEqual([{ bearerAuth: [] }]);
        expect(schema.required).toEqual(
            expect.arrayContaining([
                'title',
                'description',
                'price',
                'addressLine',
                'city',
                'bedrooms',
                'bathrooms',
                'sqft',
            ]),
        );
        expect(schema.required).not.toContain('agentId');
        expect(schema.properties.photos.items.format).toBe('uri');
        expect(schema.properties.amenities.items.type).toBe('string');
    });
});
