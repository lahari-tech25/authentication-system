const express = require('express');
const app = express();
const port = 8080;

app.get('/',(req,res)=>{
    res.send('Hello World from Auth system hey this is me  ');
});

app.get('/users',(req,res)=>{
    res.send('User API endpoint');
})

app.listen(port,()=>{
    console.log(`server is running on ${port}`);
});