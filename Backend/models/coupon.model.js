const mongoose = require("mongoose");

const couponSchema= new mongoose.Schema(
    {
        code:{
            type:String,
            required:true,
            unique:true,
            uppercase:true,
            trim:true
        },
        type:{
            type:String,
            enum:["flat","percent"],
            required:true
        },
        value:{
            type:Number,
            required:true

        },
        isActive:{
            type:Boolean,
            default:true
        },
        expiresAt:{
            type:Date,
            default:null
        },
        maxUsesTotal:{
            type:Number,
            default:null
        },
        maxUsesPerUser:{
            type:Number,
            default:1
        },
        usedCount:{
            type:Number,
            default:0
        }

    },{timestamps:true}
)
module.exports = mongoose.model('Coupon', couponSchema);