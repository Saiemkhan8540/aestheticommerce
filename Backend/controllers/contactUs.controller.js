const ContactUs=require("../models/contactUs.model");
const sendEmail = require("../utilsSellerPanel/sendEmail")
const AppError=require("../utilsSellerPanel/AppError");

module.exports.createContactUs= async(req , res,next)=>{
    try{
    const{name,email,message}=req.body;

    if(!name || !email|| !message){
        return next(new AppError("All fields are required",400));
     
    }
    //save contact us into db 
    console.time("SaveTime");
    const newContact=new ContactUs({name,email,message});
    await newContact.save();
    console.timeEnd("SaveTime");
     
    //send acknowledgement mail to user
    await sendEmail({
        to:email,
        subject:"Thank you for contacting  Aestheticommerce",
        text:`Hi ${name},\n\nWe received your message:\n"${message}"\n\nWe'll get back to you soon!`,
        html: `<p>Hi <strong>${name}</strong>,</p><p>We received your message:</p><blockquote>${message}</blockquote><p>We'll get back to you soon!</p>`
    })

    //send mail to organization
    await sendEmail({
        to:process.env.EMAIL,
        subject:`New Contact Message from ${name}`,
        text: `You have a new message:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });
    res.status(201).json({success:true,  message: "Message sent successfully!",data:newContact});
    }catch(error){
        next(new AppError(error.message||"Failed to process contact", 500));
       
    }
};
