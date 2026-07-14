import jwt from 'jsonwebtoken';

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // eslint-disable-next-line security/detect-possible-timing-attacks -- presence check against null, not a secret comparison
    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }

        req.user = user;

        next();
    });
}

export default authenticate;
