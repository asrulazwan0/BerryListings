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
    let otherToken;
    let adminToken;
    let disabledToken;
    let otherUser;
    let adminUser;
    let disabledUser;
    const createdUuids = [];

    beforeAll(async () => {
        const unique = Date.now();
        owner = await prisma.user.create({
            data: {
                uuid: generateUniqueId(),
                email: `vitest-property-owner-${unique}@example.com`,
                isEnabled: true,
            },
        });
        otherUser = await prisma.user.create({
            data: {
                uuid: generateUniqueId(),
                email: `vitest-property-other-${unique}@example.com`,
                isEnabled: true,
            },
        });
        adminUser = await prisma.user.create({
            data: {
                uuid: generateUniqueId(),
                email: `vitest-property-admin-${unique}@example.com`,
                isEnabled: true,
                role: 'ADMIN',
            },
        });
        disabledUser = await prisma.user.create({
            data: {
                uuid: generateUniqueId(),
                email: `vitest-property-disabled-${unique}@example.com`,
                isEnabled: false,
            },
        });
        token = generateAccessToken({ id: owner.id, email: owner.email });
        otherToken = generateAccessToken({ id: otherUser.id, email: otherUser.email });
        adminToken = generateAccessToken({ id: adminUser.id, email: adminUser.email });
        disabledToken = generateAccessToken({ id: disabledUser.id, email: disabledUser.email });
    });

    afterAll(async () => {
        await prisma.property.deleteMany({
            where: { agentId: { in: [owner.id, otherUser.id, adminUser.id, disabledUser.id] } },
        });
        await prisma.user.deleteMany({
            where: { id: { in: [owner.id, otherUser.id, adminUser.id, disabledUser.id] } },
        });
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
        const property = res.body.data.find((item) => item.uuid === createdUuids[0]);
        expect(property).toBeDefined();
        expect(property.agent).toEqual({ uuid: owner.uuid, email: owner.email });
        expect(property.photos).toEqual([
            { url: 'https://images.example.com/maple-front.jpg', position: 0 },
            { url: 'https://images.example.com/maple-kitchen.jpg', position: 1 },
        ]);
        expect(property).not.toHaveProperty('id');
        expect(property).not.toHaveProperty('agentId');
    });

    it('fetches a property by id', async () => {
        const res = await request(app).get(`/api/v1/properties/${createdUuids[0]}`);

        expect(res.status).toBe(200);
        expect(res.body.data.uuid).toBe(createdUuids[0]);
        expect(res.body.data.agent).toEqual({ uuid: owner.uuid, email: owner.email });
        expect(res.body.data.photos).toEqual([
            { url: 'https://images.example.com/maple-front.jpg', position: 0 },
            { url: 'https://images.example.com/maple-kitchen.jpg', position: 1 },
        ]);
        expect(res.body.data).not.toHaveProperty('id');
        expect(res.body.data).not.toHaveProperty('agentId');
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

    it('rejects an update from a non-owner', async () => {
        const res = await request(app)
            .put(`/api/v1/properties/${createdUuids[0]}`)
            .set('Authorization', `Bearer ${otherToken}`)
            .send(validPropertyPayload({ title: 'Unauthorized update' }));

        expect(res.status).toBe(403);
    });

    it('rejects an update from a disabled user', async () => {
        const res = await request(app)
            .put(`/api/v1/properties/${createdUuids[0]}`)
            .set('Authorization', `Bearer ${disabledToken}`)
            .send(validPropertyPayload({ title: 'Disabled update' }));

        expect(res.status).toBe(403);
    });

    it("allows an administrator to update another user's property", async () => {
        const res = await request(app)
            .put(`/api/v1/properties/${createdUuids[0]}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send(validPropertyPayload({ title: 'Admin updated' }));

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Admin updated');
    });

    it('replaces photos when they are supplied on update', async () => {
        const res = await request(app)
            .put(`/api/v1/properties/${createdUuids[0]}`)
            .set('Authorization', `Bearer ${token}`)
            .send(
                validPropertyPayload({
                    title: 'Photo replacement',
                    photos: ['https://images.example.com/replacement.jpg'],
                }),
            );

        expect(res.status).toBe(200);
        expect(res.body.data.photos).toEqual([
            { url: 'https://images.example.com/replacement.jpg', position: 0 },
        ]);
    });

    it('preserves photos when they are omitted on update', async () => {
        const payloadWithoutPhotos = validPropertyPayload({
            title: 'Photos preserved',
        });
        delete payloadWithoutPhotos.photos;
        const res = await request(app)
            .put(`/api/v1/properties/${createdUuids[0]}`)
            .set('Authorization', `Bearer ${token}`)
            .send(payloadWithoutPhotos);

        expect(res.status).toBe(200);
        expect(res.body.data.photos).toEqual([
            { url: 'https://images.example.com/replacement.jpg', position: 0 },
        ]);
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
