const userModel = require('../models/user.model');

// Save user shipping address
module.exports.saveUserAddress = async (req, res) => {
  const { email, address } = req.body;

  if (!email || !address) {
    return res.status(400).json({ message: 'Email and address are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedAddress = address;
    await user.save();

    res.status(200).json({ message: 'Address saved successfully' });
  } catch (error) {
    console.error('Error saving address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user saved shipping address
module.exports.getUserAddress = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user || !user.savedAddress) {
      return res.status(404).json({ message: 'No saved address found' });
    }

    res.status(200).json({ address: user.savedAddress });
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ message: 'Server error' });
  }
};