import jwt from 'jsonwebtoken';

const generateAccessToken = (payload) => 
{
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "365d" });
};

export default generateAccessToken;

