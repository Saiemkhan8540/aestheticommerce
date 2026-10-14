const mongoose = require("mongoose");
const ContactUsSchema = new mongoose.Schema({
 name:{
    type:String,
    required:true,
    trim:true,   
 },
 email:{
   type:String,
   required:true,
   trim:true,
   lowercase:true
 },
 message:{
    type:String,
    required:true,
    trim:true,
 }

},
 {timestamps:true});
const ContactUs=mongoose.model("ContactUs",ContactUsSchema);
module.exports=ContactUs;