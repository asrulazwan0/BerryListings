import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import generateAccessToken from '../src/utils/jwt-utils.js';

describe('users API', () =>
{
    let token;
    let email;
    const createdUuids = [];

    beforeAll(() =>
    {
        token = generateAccessToken({ id: 1, email: 'test@test.com' });
        email = `vitest-${Date.now()}@example.com`;
    });

    afterAll(async () =>
    {
        for (const uuid of createdUuids)
        {
            await request(app).delete(`/api/v1/users/${uuid}`).set('Authorization', `Bearer ${token}`);
        }
    });

    it('rejects any request without a token', async () =>
    {
        const res = await request(app).get('/api/v1/users');

        expect(res.status).toBe(401);
    });

    it('rejects user creation with an invalid email', async () =>
    {
        const res = await request(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${token}`)
            .send({ email: 'not-an-email' });

        expect(res.status).toBe(400);
    });

    it('creates a user with a valid email', async () =>
    {
        const res = await request(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${token}`)
            .send({ email });

        expect(res.status).toBe(201);
        expect(res.body.data.email).toBe(email);
        createdUuids.push(res.body.data.uuid);
    });

    it('rejects creating a second user with the same email', async () =>
    {
        const res = await request(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${token}`)
            .send({ email });

        expect(res.status).toBe(409);
    });
});
