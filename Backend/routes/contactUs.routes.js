const express= require("express");
const router=express.Router();
const {createContactUs}=require("../controllers/contactUs.controller");

router.post('/contact-us',createContactUs);
module.exports=router;