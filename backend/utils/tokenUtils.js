const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: '15m'
        }
    );
};

const generateRefreshToken = () => {
    return crypto
        .randomBytes(64)
        .toString('hex');
};

const hashRefreshToken = (refreshToken) => {
    return crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/auth/refresh'
    });
};

const clearAuthCookies = (res) => {
    res.clearCookie('accessToken');

    res.clearCookie('refreshToken', {
        path: '/auth/refresh'
    });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    setAuthCookies,
    clearAuthCookies
};