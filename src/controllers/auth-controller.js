import authService from '../services/auth-service.js';
import userModel from '../models/user.model.js';
import generateAccessToken from '../utils/jwt-utils.js';

const authController = {
    googleLogin: async (req, res) => {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(400).json({ error: 'idToken is required' });
            }
            const result = await authService.loginWithGoogle(idToken);
            if (result.error === 'invalid_token') {
                return res.status(401).json({ error: 'Invalid Google token' });
            }
            if (result.error === 'not_registered') {
                return res.status(403).json({ error: 'This email is not registered.' });
            }
            res.status(200).json({
                message: 'Login successful',
                data: { token: result.token, user: { uuid: result.user.uuid, email: result.user.email, role: result.user.role } },
            });
        } catch (error) {
            console.error(error.stack);
            res.status(500).json({ error: 'Error logging in' });
        }
    },

    /** Dev-only: login by email — bypasses Google OAuth. Requires NODE_ENV=development. */
    devLogin: async (req, res) => {
        if (process.env.NODE_ENV !== 'development' && !process.env.ALLOW_DEV_LOGIN) {
            return res.status(404).json({ error: 'Not found' });
        }
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ error: 'email is required' });
            const user = await userModel.getUserByEmail(email);
            if (!user || !user.isEnabled) {
                return res.status(403).json({ error: 'Email not registered or disabled.' });
            }
            const token = generateAccessToken({ id: user.id, email: user.email });
            res.status(200).json({
                message: 'Dev login successful',
                data: { token, user: { uuid: user.uuid, email: user.email, role: user.role } },
            });
        } catch (error) {
            console.error(error.stack);
            res.status(500).json({ error: 'Error logging in' });
        }
    },
};

export default authController;
