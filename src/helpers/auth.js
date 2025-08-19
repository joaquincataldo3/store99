import jwt from 'jsonwebtoken';

export const checkIfLogged = (req, res) => {
 const token = req.cookies?.userAccessToken;

    if (token) {
        try {
            jwt.verify(token, process.env.JSONWEBTOKEN_SECRET);
            return true;
            } catch (err) {
            console.log('Token inválido:', err.message);
        }
    }

    return false;
};