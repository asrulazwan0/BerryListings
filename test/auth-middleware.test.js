import 'dotenv/config';
import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import authenticate from '../src/middlewares/auth.middleware.js';

describe('authenticate middleware', () => {
    it('responds 401 when no Authorization header is present', () => {
        const req = { headers: {} };
        const res = { sendStatus: vi.fn() };
        const next = vi.fn();

        authenticate(req, res, next);

        expect(res.sendStatus).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('responds 403 when the token is invalid', () => {
        const req = { headers: { authorization: 'Bearer not-a-real-token' } };
        const res = { sendStatus: vi.fn() };
        const next = vi.fn();

        authenticate(req, res, next);

        return new Promise((resolve) => {
            setImmediate(() => {
                expect(res.sendStatus).toHaveBeenCalledWith(403);
                expect(next).not.toHaveBeenCalled();
                resolve();
            });
        });
    });

    it('calls next and sets req.user when the token is valid', () => {
        const token = jwt.sign({ id: 1, email: 'test@test.com' }, process.env.JWT_SECRET);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = { sendStatus: vi.fn() };
        const next = vi.fn();

        authenticate(req, res, next);

        return new Promise((resolve) => {
            setImmediate(() => {
                expect(next).toHaveBeenCalledOnce();
                expect(res.sendStatus).not.toHaveBeenCalled();
                expect(req.user).toMatchObject({ id: 1, email: 'test@test.com' });
                resolve();
            });
        });
    });
});
