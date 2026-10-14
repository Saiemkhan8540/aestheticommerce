const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
   email : {
    type : String,
    required : true,
    unique : true
   },

   subscribedAt : {
    type : Date,
    default  : Date.now,
   }
})

const SubscriberModel = mongoose.model('Subscriber',SubscriberSchema);
module.exports = SubscriberModel ;