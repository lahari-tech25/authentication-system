require('dotenv').config();

const express = require('express');
const connectDB = require('./db');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authenticate = require('./middleware/authMiddleware');

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



app.post('/users/register',async (req,res)=>{
    try{
        const user = await User.create(req.body);
        res.status(201).json({
            message:"User created successfully",
            user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
       }
        });
    }catch(error){
        res.status(500).json({
            message:"Failed to create user",
            error:error.message
        });
    }
});

//login
app.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

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

        //token generation

        const token = jwt.sign(
    {
        userId: user._id,
        role: user.role
    },
    process.env.JWT_SECRET_KEY,
    {
        expiresIn: '1h'
    }
);
       //cookie response
       res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000
});

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
});

//get users
app.get('/users/profile', authenticate, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
    });
});

app.listen(port,()=>{
    console.log(`server is running on ${port}`);
});