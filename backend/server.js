require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const connectDB = require('./db');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authenticate = require('./middleware/authMiddleware');
const authorize = require('./middleware/roleMiddleware');
const RefreshToken = require('./models/refreshToken');

const authRoutes = require('./routes/authRoutes');

const app = express();
const port = 8080;

//json  parser middleware 
app.use(express.json());

//connect the database
connectDB();

//cookie parser
app.use(express.json());
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.send('Hello World from Auth system hey this is me  ');
});

app.use('/auth', authRoutes);






//get users profile
app.get('/users/profile', authenticate, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
    });
});

//admin dashboard
app.get(
    '/admin/dashboard',
    authenticate,
    authorize('admin'),
    (req, res) => {
        res.json({
            message: "Welcome to the admin dashboard",
            user: req.user
        });
    }
);





app.listen(port,()=>{
    console.log(`server is running on ${port}`);
});