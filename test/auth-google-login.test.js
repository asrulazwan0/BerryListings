import 'dotenv/config';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../src/app.js';
import generateUniqueId from '../src/utils/unique-id.js';

const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));

vi.mock('google-auth-library', () => ({
    OAuth2Client: vi.fn().mockImplementation(function OAuth2Client()
    {
        return { verifyIdToken };
    }),
}));

const prisma = new PrismaClient();

describe('POST /api/v1/auth/google', () =>
{
    let enabledEmail;
    let disabledEmail;

    beforeAll(async () =>
    {
        enabledEmail = `vitest-google-${Date.now()}@example.com`;
        disabledEmail = `vitest-google-disabled-${Date.now()}@example.com`;

        await prisma.user.create({
            data: { uuid: generateUniqueId(), email: enabledEmail, isEnabled: true, role: 'USER' },
        });
        await prisma.user.create({
            data: { uuid: generateUniqueId(), email: disabledEmail, isEnabled: false, role: 'USER' },
        });
    });

    afterAll(async () =>
    {
        await prisma.user.delete({ where: { email: enabledEmail } });
        await prisma.user.delete({ where: { email: disabledEmail } });
        await prisma.$disconnect();
    });

    it('rejects a request with no idToken', async () =>
    {
        const res = await request(app).post('/api/v1/auth/google').send({});

        expect(res.status).toBe(400);
    });

    it('rejects an invalid/unverifiable Google token', async () =>
    {
        verifyIdToken.mockRejectedValueOnce(new Error('bad token'));

        const res = await request(app).post('/api/v1/auth/google').send({ idToken: 'garbage' });

        expect(res.status).toBe(401);
    });

    it('rejects a verified token whose email is not registered', async () =>
    {
        verifyIdToken.mockResolvedValueOnce({
            getPayload: () => ({ email: 'stranger@example.com', email_verified: true }),
        });

        const res = await request(app).post('/api/v1/auth/google').send({ idToken: 'valid' });

        expect(res.status).toBe(403);
    });

    it('rejects a verified token for a disabled user', async () =>
    {
        verifyIdToken.mockResolvedValueOnce({
            getPayload: () => ({ email: disabledEmail, email_verified: true }),
        });

        const res = await request(app).post('/api/v1/auth/google').send({ idToken: 'valid' });

        expect(res.status).toBe(403);
    });

    it('logs in an enabled, registered user and returns a bearer token', async () =>
    {
        verifyIdToken.mockResolvedValueOnce({
            getPayload: () => ({ email: enabledEmail, email_verified: true }),
        });

        const res = await request(app).post('/api/v1/auth/google').send({ idToken: 'valid' });

        expect(res.status).toBe(200);
        expect(res.body.data.token).toEqual(expect.any(String));
        expect(res.body.data.user.email).toBe(enabledEmail);

        const propertiesRes = await request(app)
            .post('/api/v1/properties')
            .set('Authorization', `Bearer ${res.body.data.token}`)
            .send({ title: 'From google login', description: 'desc', price: '100' });

        expect(propertiesRes.status).toBe(201);
        await request(app)
            .delete(`/api/v1/properties/${propertiesRes.body.data.uuid}`)
            .set('Authorization', `Bearer ${res.body.data.token}`);
    });
});
