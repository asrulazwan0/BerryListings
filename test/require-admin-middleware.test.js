import 'dotenv/config';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import requireAdmin from '../src/middlewares/require-admin.middleware.js';
import userModel from '../src/models/user.model.js';

vi.mock('../src/models/user.model.js', () => ({
    default: { getUserByEmail: vi.fn() },
}));

describe('requireAdmin middleware', () =>
{
    beforeEach(() =>
    {
        vi.clearAllMocks();
    });

    it('responds 403 when no matching user exists', async () =>
    {
        userModel.getUserByEmail.mockResolvedValue(null);

        const req = { user: { email: 'ghost@example.com' } };
        const res = { sendStatus: vi.fn() };
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(res.sendStatus).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('responds 403 when the user is not an admin', async () =>
    {
        userModel.getUserByEmail.mockResolvedValue({ email: 'user@example.com', role: 'USER', isEnabled: true });

        const req = { user: { email: 'user@example.com' } };
        const res = { sendStatus: vi.fn() };
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(res.sendStatus).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('responds 403 when the admin is disabled', async () =>
    {
        userModel.getUserByEmail.mockResolvedValue({ email: 'admin@example.com', role: 'ADMIN', isEnabled: false });

        const req = { user: { email: 'admin@example.com' } };
        const res = { sendStatus: vi.fn() };
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(res.sendStatus).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('calls next when the user is an enabled admin', async () =>
    {
        userModel.getUserByEmail.mockResolvedValue({ email: 'admin@example.com', role: 'ADMIN', isEnabled: true });

        const req = { user: { email: 'admin@example.com' } };
        const res = { sendStatus: vi.fn() };
        const next = vi.fn();

        await requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.sendStatus).not.toHaveBeenCalled();
    });
});
