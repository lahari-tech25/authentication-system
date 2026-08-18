const bcrypt = require('bcrypt');
const {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    setAuthCookies,
    clearAuthCookies
} = require('../utils/tokenUtils');

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const register = async (req, res) => {
    try {
        const user = await User.create(req.body);

        return res.status(201).json({
            message: "User created successfully",
            user: user
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create user",
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const accessToken = generateAccessToken(user);

       const refreshToken = generateRefreshToken();

        const refreshTokenHash = hashRefreshToken(refreshToken);

        await RefreshToken.create({
            userId: user._id,
            tokenHash: refreshTokenHash,
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            )
        });

        setAuthCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
};

const refresh = async (req, res) => {
     try {
            const refreshToken = req.cookies.refreshToken;
    
            if (!refreshToken) {
                return res.status(401).json({
                    message: "Refresh token required"
                });
            }
    
            const refreshTokenHash = hashRefreshToken(refreshToken);
    
            const storedToken = await RefreshToken.findOne({
                tokenHash: refreshTokenHash
            });
    
            if (!storedToken) {
                return res.status(401).json({
                    message: "Invalid refresh token"
                });
            }
    
            if (storedToken.revoked) {
                return res.status(401).json({
                    message: "Refresh token has been revoked"
                });
            }
    
            if (storedToken.expiresAt < new Date()) {
                return res.status(401).json({
                    message: "Refresh token expired"
                });
            }
    
            const user = await User.findById(storedToken.userId);
    
            if (!user) {
                return res.status(401).json({
                    message: "User no longer exists"
                });
            }
    
            // Revoke old refresh token
            storedToken.revoked = true;
            await storedToken.save();
    
            // Generate new refresh token
            const newRefreshToken = generateRefreshToken();
    
            // Hash new refresh token
            const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    
            // Store new refresh token
            await RefreshToken.create({
                userId: user._id,
                tokenHash: newRefreshTokenHash,
                expiresAt: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                )
            });
    
            // Generate new access token
            const newAccessToken = generateAccessToken(user);
    
            // New access token cookie and refresh token 
           setAuthCookies(res, newAccessToken, newRefreshToken);

            return res.status(200).json({
                message: "Token refreshed successfully"
            });
    
        } catch (error) {
             return res.status(500).json({
                message: "Refresh failed",
                error: error.message
            });
        }
};

const logout = async (req, res) => {
     try {
            const refreshToken = req.cookies.refreshToken;
    
            if (refreshToken) {
                const refreshTokenHash = hashRefreshToken(refreshToken);
    
                const storedToken = await RefreshToken.findOne({
                    tokenHash: refreshTokenHash
                });
    
                if (storedToken) {
                    storedToken.revoked = true;
                    await storedToken.save();
                }
            }
    
            clearAuthCookies(res);
    
            return res.status(200).json({
                message: "Logout successful"
            });
    
        } catch (error) {
            return res.status(500).json({
                message: "Logout failed",
                error: error.message
            });
        }
};

module.exports = {
    register, 
    login ,
    refresh,
    logout
};