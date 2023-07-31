const mongoose= require('mongoose')



const userSchema= new mongoose.Schema({
   name:{
       type:String,
       reqiured:true,
       unique:true
   },
   password:{
      type:String,
      reqiured:true 
   },
   email:{
       type:String,
       reqiured:true,
       unique:true
   },
   age:{
         type:Number,
         reqiured:true
   },
   refreshToken:{
       type:String
   }
   
})
module.exports=mongoose.model('user',userSchema)    