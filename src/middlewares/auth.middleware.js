import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()

export const checkUserAuth = (req, res, next) => {
  try {
    
    const token = req.cookies?.userAccessToken;
    if (!token) {
      return res.status(401).json({ ok: false, msg: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JSONWEBTOKEN_SECRET); 
    req.user = decoded;
    return next();
    
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ ok: false, msg: 'Invalid or expired token' });
  }
};