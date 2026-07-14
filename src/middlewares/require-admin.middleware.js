import userModel from '../models/user.model.js';

async function requireAdmin(req, res, next) {
    try {
        const user = await userModel.getUserByEmail(req.user?.email);

        if (!user || !user.isEnabled || user.role !== 'ADMIN') {
            return res.sendStatus(403);
        }

        next();
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ error: 'Error checking admin authorization' });
    }
}

export default requireAdmin;
