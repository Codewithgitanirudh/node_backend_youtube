
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.Modal.js';

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    try {
        const { accessToken } = req.cookies?.accessToken || req.header?.("Authorization")?.split(' ')[1];
    
        if(!accessToken) {
            throw new ApiError(401, 'Unauthorized');
        }
    
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select('-password -refreshToken');
        if(!user) {
            throw new ApiError(401, 'Unauthorized');
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error.message || "invalid access token");
    }
});

export { verifyAccessToken };