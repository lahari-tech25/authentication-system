require('dotenv').config();

const express = require('express');
const connectDB = require('./db');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
const port = 8080;

//json  parser middleware 
app.use(express.json());
//connect the database
connectDB();

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

app.listen(port,()=>{
    console.log(`server is running on ${port}`);
});