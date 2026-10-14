const Subscriber = require("../models/NlLetterSubs.model");

/**
 * Handles new newsletter subscriptions
 * POST /api/subscribe
 */
module.exports.subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    // Normalizing email
    const normalizedEmail = email.trim().toLowerCase();
    
    await Subscriber.create({ email: normalizedEmail });
    
    return res.status(201).json({ msg: "Subscribed Successfully" });
  } catch (err) {
    // Handling duplicate email error (MongoDB code 11000)
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Email already exists" });
    }
    
    console.error("Newsletter Subscription Error:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};
