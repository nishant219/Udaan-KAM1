import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import logger from '../config/winston.js';

const auth = async (req, res, next)=>{
    try{
        const token = req?.headers?.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null;

        if (!token) {
            logger.error('Unauthorized: No token provided');
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const currUser = await User.findById(decoded.id);
        if (!currUser) {
            logger.error('Unauthorized: No user found');
            return res.status(401).json({ error: 'Unauthorized: No user found' });
        }

        req.user = currUser;
        next();
    }catch(error){
        if (error.name === 'TokenExpiredError') {
            logger.error('Unauthorized: Token expired');
            return res.status(401).json({ error: 'Unauthorized: Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            logger.error('Unauthorized: Invalid token');
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        logger.error('Unauthorized:', error.message);
        return res.status(401).json({ error: 'Unauthorized' });
    }
}

export default auth;