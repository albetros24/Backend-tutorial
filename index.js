const express=require('express');
const bodyParser=require('body-parser');
const cors=require('cors');
const PORT=8000 ;
//to use .env file
require('dotenv').config();
const userRoutes =require('./Controller/userRoutes');
const app=express();
require('./db');
app.use(bodyParser.json());
app.use(cors());

app.use('/user',userRoutes);
///error handling 
//just specify next in whatever middleware you want to use error handling
app.use((err,req,res,next)=>{
    console.log(err);
    res.status(500).json({message:err.message})
})

app.get('/',(req,res)=>{
    res.send('Hello from server')
})



















app.listen(PORT,()=>{ console.log(`Server is running on port ${PORT}`)});

