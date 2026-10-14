const Coupon=require("../models/coupon.model");
const couponUsage=require("../models/couponUsage.model");
const asyncHandler=require("../utils/asyncHandler");
const AppError = require('../utilsSellerPanel/AppError');

//coupon validation
const validateCoupon=asyncHandler(async(req,res)=>{
    const {code,cartTotal}=req.body;
    //getting the user id from auth middleware
    const userId=req.user._id;
  
     //1 check if coupon exists or not
     const coupon = await Coupon.findOne({code:code.toUpperCase(),isActive:true});
     if(!coupon){
       throw new AppError("Invalid coupon code", 400)
     }

     if(coupon.expiresAt && new Date()>coupon.expiresAt){
        throw new AppError("Coupon has expired", 400);
     }

     if(coupon.maxUsesTotal && coupon.usedCount>coupon.maxUsesTotal){
       throw new AppError("Coupon limit reached", 400);
     }

     //check for per user 
     const userUsageCount=await couponUsage.countDocuments(
        {
            userId:userId,
            couponId:coupon._id
        }
     );
     if(userUsageCount>=coupon.maxUsesPerUser){
        throw new AppError("You have already used this coupon", 400);
     }

     //calculate discount
     let discountAmount=0;
     if(coupon.type==="flat"){
        discountAmount=coupon.value;
     }else if(coupon.type==="percent"){
        discountAmount=(cartTotal*coupon.value)/100;
     }

     //now cap the discount ammount
     discountAmount=Math.min(discountAmount,cartTotal);//so that negative mai na jaye answer
     const finalTotal=cartTotal-discountAmount;

     return res.status(200).json({
        success:true,
        message: "Coupon applied successfully",
        data:{
            discountCode:coupon.code,
            discountType:coupon.type,
            discountValue:coupon.value,
            discountAmount,
            finalTotal

        }
     })

})

module.exports={validateCoupon};
