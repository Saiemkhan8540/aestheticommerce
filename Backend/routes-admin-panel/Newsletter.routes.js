const express = require('express');
const Subscriber = require("../models/NlLetterSubs.model");
const sendNewsLetter = require("../utilsAdminPanel/NewsLetterEmail")

const router = express.Router();

router.post('/NLsend' , async (req, res)=>{
    const {subject , message} = req.body;

    const subscribers = await Subscriber.find({} , "email");

    await Promise.all(
        subscribers.map( sub => sendNewsLetter(sub.email , subject , message))
    );


    res.json({ msg : " Newsletter send to all the subscriber!"})
})

module.exports = router;