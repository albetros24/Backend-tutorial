const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt= require('bcryptjs');
const jwt= require('jsonwebtoken');
const User= require('./Models/userSchema');
const userSchema = require('./Models/userSchema');

//error handling
//express error handling middleware
//makes the work more easily and efficiently
//next is used to pass the error to the next middleware
//reduces the code in the try catch block
router.use((err,req,res,next)=>{
    console.log(err);
    res.status(500).json({message:err.message})
})
//end of error handling middleware
//note: in catch block we already have need not to creat a new error object  whereas in try block we have to create a new error object


//token checking 
function authenticateToken(req,res,next){
const token= req.headers.authorization;
  
   const{id}=req.body
   if(!token) return res.status(401).json({message:"Unauthorized"})
   try{
     const decoded=jwt.verify(token,process.env.JWT_SECRET);
    if(id && decoded.id!==id)
    { const err= new Error("Unauthorized");
      return next(err)
    }
     req.id=decoded;
        next();
   }
   catch(err)
   {
    next(err)
   }

} 
//end of token checking middleware

router.get('/', (req, res,next) => {
    ///next is used to pass the error to the next middleware
    //48 used to pass the error from router to index.js where the error handling middleware is defined
    someAsyncFunction(function(err, result) {
        if (err) {
            next(err); // Handle this error
        }
    })
});



//Signup Route
router.post('/register',async(req,res)=>{
    try{
    const {name,password,email,age}=req.body;
     const existingUser= await User.findOne({email});
        if(existingUser)
        {
            return res.status(400).json({message:"User already exists"});
        }

        //salt is used to hash the password
        const salt= await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password,salt);
     // hasedpasswaord is the password that is stored in the database
     const newUser= new userSchema({
            name,
            password:hashedPassword,
            email,
            age
        })
        await newUser.save(); 
        res.status(200).json({message:"User Registered Successfully"});

    }
    catch(err)
    {
        res.status(500).json({message:err.message})
    }
})
//end of signup route

//Login Route
 router.post('/login',async(req,res,next)=>{
    try{
         const{email,password}=req.body;
          const  existingUser= await User.findOne({email})
           if(!existingUser)
           {
               return res.status(400).json({message:"User does not exists"});
           }
           const isPasswordCorrect= await bcrypt.compare(password,existingUser.password);
           if(!isPasswordCorrect)
           {
               return res.status(400).json({message:"Invalid Credentials"});
           }
                                                                                            
     //creating token for the user having unqiue value  consiting of header playload and signature
    
          ///access token  line no100
           const accesstoken= jwt.sign({id:existingUser._id},process.env.JWT_SECRET,{
            expiresIn: '1m'
        });
 
            ///refresh token
        const refreshtoken= jwt.sign({id:existingUser._id},process.env.JWT_REFRESH_SECRET);    
  ///storing the refresh token in the database
        existingUser.refreshToken=refreshtoken;
        await existingUser.save();   
        //saving the refresh token in the database
     
//res.cookie used to store the refresh token in the cookie
//httpOnly is used so that the cookie cannot be accessed by the javascript
res.cookie('refreshToken',refreshtoken,{ httpOnly :true, path:'/user/refresh_token'});

              res.status(200).json({
                accesstoken,
                refreshtoken,
                message:"User Logged in Successfully"});
    }
    catch(err)
    {
        next(err)
    }

 })
 ///end of login route

///generating new refresh token
///post get both can be used but post is more secure

router.get('/refresh_token',async(req,res,next)=>{
    const token= req.cookies.refreshToken;
    if(!token){
        const err=new Error("Unauthorized");
          next(err);
    }
    jwt.verify(token,process.env.JWT_REFRESH_SECRET,async(err,decoded)=>{
        if(err)
        {
            const error= new Error("Unauthorized");
            next(error);
        }
        const id=decoded.id;
        const existingUser= await User.findById(id);
        if(!existingUser||token!==existingUser.refreshToken)
        {
            const error= new Error("User does not exists");
            next(error);
        }
        const accesstoken= jwt.sign({id:existingUser._id},process.env.JWT_SECRET,{
            expiresIn: '1m'
        });
 
            ///refresh token
        const refreshtoken= jwt.sign({id:existingUser._id},process.env.JWT_REFRESH_SECRET);    
  ///storing the refresh token in the database
        existingUser.refreshToken=refreshtoken;
        await existingUser.save();   
        //saving the refresh token in the database
     
//res.cookie used to store the refresh token in the cookie
//httpOnly is used so that the cookie cannot be accessed by the javascript
res.cookie('refreshToken',refreshtoken,{ httpOnly :true, path:'/user/refresh_token'});

              res.status(200).json({
                accesstoken,
                refreshtoken,
                message:"New Token created Successfully"});


    })

})


//Get UserProfile
router.get('/profile',authenticateToken,async(req,res)=>{
  const {id}=req.body;
  const user= await User.findById(id);
  //made password undefined so that it is not shown in the response
  user.password=undefined;
    res.status(200).json({user})  
})





module.exports = router;