import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()

export const checkUserAuth = (req, res, next) => {
  const isApiRequest = req.originalUrl.startsWith('/api') || req.xhr || req.headers.accept?.includes('application/json');

  const reject = () => {
    if (isApiRequest) return res.status(401).json({ ok: false, msg: 'Unauthorized' });
    return res.redirect('/inicio-sesion');
  };

  try {
    const token = req.cookies?.userAccessToken;
    if (!token) return reject();

    const decoded = jwt.verify(token, process.env.JSONWEBTOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return reject();
  }
};