import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app.js';
import generateAccessToken from '../src/utils/jwt-utils.js';
import generateUniqueId from '../src/utils/unique-id.js';

const prisma = new PrismaClient();

describe('users API', () =>
{
    let adminToken;
    let adminEmail;
    let email;
    const createdUuids = [];

    beforeAll(async () =>
    {
        adminEmail = `vitest-admin-${Date.now()}@example.com`;
        await prisma.user.create({
            data: { uuid: generateUniqueId(), email: adminEmail, isEnabled: true, role: 'ADMIN' },
        });

        adminToken = generateAccessToken({ id: 1, email: adminEmail });
        email = `vitest-${Date.now()}@example.com`;
    });

    afterAll(async () =>
    {
        for (const uuid of createdUuids)
        {
            await request(app).delete(`/api/v1/users/${uuid}`).set('Authorization', `Bearer ${adminToken}`);
        }

        await prisma.user.delete({ where: { email: adminEmail } });
        await prisma.$disconnect();
    });

    it('rejects any request without a token', async () =>
    {
        const res = await request(app).get('/api/v1/users');

        expect(res.status).toBe(401);
    });

    it('rejects a caller with a valid token who is not an admin', async () =>
    {
        const token = generateAccessToken({ id: 999, email: 'not-an-admin@example.com' });
        const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });

    it('rejects user creation with an invalid email', async () =>
    {
        const res = await request(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ email: 'not-an-email' });

        expect(res.status).toBe(400);
    });

    it('creates a user with a valid email', async () =>
    {
        const res = await request(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ email });

        expect(res.status).toBe(201);
        expect(res.body.data.email).toBe(email);
        createdUuids.push(res.body.data.uuid);
    });

    it('rejects creating a second user with the same email', async () =>
    {
        const res = await request(app)
            .post('/api/v1/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ email });

        expect(res.status).toBe(409);
    });
});
