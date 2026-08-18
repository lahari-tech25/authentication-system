const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
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

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticate;