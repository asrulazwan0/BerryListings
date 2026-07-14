import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import generateAccessToken from '../src/utils/jwt-utils.js';

describe('properties API', () => {
    let token;
    const createdUuids = [];

    beforeAll(() => {
        token = generateAccessToken({ id: 1, email: 'test@test.com' });
    });

    afterAll(async () => {
        for (const uuid of createdUuids) {
            await request(app)
                .delete(`/api/v1/properties/${uuid}`)
                .set('Authorization', `Bearer ${token}`);
        }
    });

    it('rejects property creation without a token', async () => {
        const res = await request(app)
            .post('/api/v1/properties')
            .send({ title: 'No auth', description: 'desc', price: '100' });

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
            .send({ title: 'Bad price', description: 'desc', price: '-5' });

        expect(res.status).toBe(400);
    });

    it('creates a property with a valid body', async () => {
        const res = await request(app)
            .post('/api/v1/properties')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Villa', description: 'A nice place', price: '250000' });

        expect(res.status).toBe(201);
        expect(res.body.data).toMatchObject({
            title: 'Test Villa',
            description: 'A nice place',
            price: 250000,
        });
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
            .send({ title: 'Updated Villa', description: 'Updated desc', price: '260000' });

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe('Updated Villa');
    });

    it('rejects update without a token', async () => {
        const res = await request(app)
            .put(`/api/v1/properties/${createdUuids[0]}`)
            .send({ title: 'x', description: 'y', price: '1' });

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
