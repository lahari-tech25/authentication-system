const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken; //Get the JWT from the accessToken cookie.

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(   //decoded will contain the claims after verify
            token,
            process.env.JWT_SECRET_KEY
        );

        req.user = decoded; //We're attaching the authenticated user's information to the request.

        //we are directly fetching the user from database don't rely on the role stored in the JWT for authorization. We'll verify the token, fetch the current user from MongoDB, and attach that user to req.user.
        //This gives us a clean foundation for role-based access.
        const user = await User.findById(decoded.userId).select('-password'); //we dont want to retrieve sensitive info

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticate;