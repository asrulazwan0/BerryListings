import { OAuth2Client } from 'google-auth-library';
import userModel from '../models/user.model.js';
import generateAccessToken from '../utils/jwt-utils.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authService = {
    loginWithGoogle: async (idToken) =>
    {
        let payload;

        try
        {
            const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
            payload = ticket.getPayload();
        }
        catch (error)
        {
            return { error: 'invalid_token' };
        }

        if (!payload?.email || !payload.email_verified)
        {
            return { error: 'invalid_token' };
        }

        const user = await userModel.getUserByEmail(payload.email);

        if (!user || !user.isEnabled)
        {
            return { error: 'not_registered' };
        }

        const token = generateAccessToken({ id: user.id, email: user.email });

        return { token, user };
    },
}

export default authService
