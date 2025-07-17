import jwt from 'jsonwebtoken';

export const checkUserAuth = (req, res, next) => {
  try {
    
    if (req.session?.userLoggedId) {
      return next();
    }
    const token = req.cookies?.userAccessToken;
    if (!token) {
      return res.status(401).json({ ok: false, msg: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded;
    return next();
    
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ ok: false, msg: 'Invalid or expired token' });
  }
};