import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import generateAccessToken from '../src/utils/jwt-utils.js';

describe('generateAccessToken', () =>
{
    it('returns a token that decodes back to the given payload', () =>
    {
        const token = generateAccessToken({ id: 1, email: 'test@test.com' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded).toMatchObject({ id: 1, email: 'test@test.com' });
        expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('throws when verified with the wrong secret', () =>
    {
        const token = generateAccessToken({ id: 1, email: 'test@test.com' });

        expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
    });
});
