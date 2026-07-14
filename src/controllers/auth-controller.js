import authService from '../services/auth-service.js';

const authController = {
    googleLogin: async (req, res) =>
    {
        try
        {
            const { idToken } = req.body;

            if (!idToken)
            {
                return res.status(400).json({ error: 'idToken is required' });
            }

            const result = await authService.loginWithGoogle(idToken);

            if (result.error === 'invalid_token')
            {
                return res.status(401).json({ error: 'Invalid Google token' });
            }

            if (result.error === 'not_registered')
            {
                return res.status(403).json({ error: 'This email is not registered. Contact an admin to be added.' });
            }

            res.status(200).json({
                message: 'Login successful',
                data: {
                    token: result.token,
                    user: {
                        uuid: result.user.uuid,
                        email: result.user.email,
                        role: result.user.role,
                    },
                },
            });
        }
        catch (error)
        {
            console.error(error.stack);
            res.status(500).json({ error: 'Error logging in' });
        }
    },
}

export default authController
