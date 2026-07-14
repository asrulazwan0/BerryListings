import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app.js';
import generateAccessToken from '../src/utils/jwt-utils.js';
import generateUniqueId from '../src/utils/unique-id.js';

const prisma = new PrismaClient();

const validPropertyPayload = (overrides = {}) => ({
    title: 'Maple Ridge Craftsman',
    description: 'A thoughtfully updated craftsman home.',
    price: '685000',
    type: 'HOUSE',
    status: 'ACTIVE',
    addressLine: '214 Maple Ridge Rd',
    city: 'Ashbourne',
    bedrooms: '4',
    bathrooms: '3',
    sqft: '2340',
    lotSizeAcres: '0.4',
    yearBuilt: '2018',
    amenities: ['Attached garage', 'Hardwood floors'],
    photos: [
        'https://images.example.com/maple-front.jpg',
        'https://images.example.com/maple-kitchen.jpg',
    ],
    ...overrides,
});

describe('properties API', () => {
    let token;
    let owner;
    const createdUuids = [];

    beforeAll(async () => {
        owner = await prisma.user.create({
            data: {
                uuid: generateUniqueId(),
                email: `vitest-property-owner-${Date.now()}@example.com`,
                isEnabled: true,
            },
        });
        token = generateAccessToken({ id: owner.id, email: owner.email });
    });

    afterAll(async () => {
        await prisma.property.deleteMany({ where: { agentId: owner.id } });
        await prisma.user.delete({ where: { id: owner.id } });
        await prisma.$disconnect();
    });

    it('rejects property creation without a token', async () => {
        const res = await request(app).post('/api/v1/properties').send(validPropertyPayload());

        expect(res.status).toBe(401);
    });

    it('rejects property creation with an invalid body', async () => {
        const res = await request(app)
            .post('/api/v1/properties')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeInstanceOf(Array);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('rejects a non-positive price', async () => {
        const res = await request(app)
            .post('/api/v1/properties')
            .set('Authorization', `Bearer ${token}`)
            .send(validPropertyPayload({ price: '-5' }));

        expect(res.status).toBe(400);
    });

    it('creates a property with a valid body', async () => {
        const res = await request(app)
            .post('/api/v1/properties')
            .set('Authorization', `Bearer ${token}`)
            .send(validPropertyPayload());

        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject({
            title: 'Maple Ridge Craftsman',
            description: 'A thoughtfully updated craftsman home.',
            price: 685000,
        });
        expect(res.body.data.agent).toEqual({ uuid: owner.uuid, email: owner.email });
        expect(res.body.data.photos).toEqual([
            { url: 'https://images.example.com/maple-front.jpg', position: 0 },
            { url: 'https://images.example.com/maple-kitchen.jpg', position: 1 },
        ]);
        expect(res.body.data).not.toHaveProperty('id');
        expect(res.body.data).not.toHaveProperty('agentId');
        createdUuids.push(res.body.data.uuid);
    });

    it('lists properties, including the one just created', async () => {
        const res = await request(app).get('/api/v1/properties');

        expect(res.status).toBe(200);
        expect(res.body.data.some((p) => p.uuid === createdUuids[0])).toBe(true);
    });

    it('fetches a property by id', async () => {
        const res = await request(app).get(`/api/v1/properties/${createdUuids[0]}`);

        expect(res.status).toBe(200);
        expect(res.body.data.uuid).toBe(createdUuids[0]);
    });

    it('returns 404 for a nonexistent property', async () => {
        const res = await request(app).get('/api/v1/properties/does-not-exist');

        expect(res.status).toBe(404);
    });

    it('updates a property', async () => {
        const res = await request(app)
            .put(`/api/v1/properties/${createdUuids[0]}`)
            .set('Authorization', `Bearer ${token}`)
            .send(validPropertyPayload({ title: 'Updated Villa', price: '260000' }));

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Updated Villa');
    });

    it('rejects update without a token', async () => {
        const res = await request(app)
            .put(`/api/v1/properties/${createdUuids[0]}`)
            .send(validPropertyPayload({ title: 'x', description: 'y', price: '1' }));

        expect(res.status).toBe(401);
    });

    it('deletes a property', async () => {
        const res = await request(app)
            .delete(`/api/v1/properties/${createdUuids[0]}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(204);

        const getRes = await request(app).get(`/api/v1/properties/${createdUuids[0]}`);
        expect(getRes.status).toBe(404);

        createdUuids.pop();
    });

    it('rejects delete without a token', async () => {
        const res = await request(app).delete('/api/v1/properties/does-not-exist');

        expect(res.status).toBe(401);
    });
});
