const Contact = require('../models/contact.model');
const Notification = require('../models/notification.model');
const Seller = require('../models/seller.model');
const Admin = require('../models/admin.model');

console.log('ContactController loaded with models:', {
  Contact: !!Contact,
  Notification: !!Notification,
  Seller: !!Seller,
  Admin: !!Admin
});

exports.createContactMessage = async (req, res) => {
  try {
    console.log('Creating contact message with data:', req.body);
    
    // First, just save the contact message
    const contact = new Contact(req.body);
    await contact.save();
    console.log('Contact message saved successfully');

    // Create notification for admin if it's from a seller
    if (req.body.isFromSeller && req.body.sellerId) {
      console.log('Message is from seller, creating admin notifications...');
      
      try {
        const seller = await Seller.findById(req.body.sellerId);
        if (seller) {
          console.log('Found seller:', seller.sellerName);
          
          // Find all admins and create notifications for each
          const admins = await Admin.find({});
          console.log('Found admins count:', admins.length);
          
          if (admins.length === 0) {
            console.log('WARNING: No admins found in database. Creating default admin...');
            // Create a default admin for testing
            const defaultAdmin = new Admin({
              email: 'admin@test.com',
              password: 'admin123'
            });
            await defaultAdmin.save();
            console.log('Created default admin for testing');
            admins.push(defaultAdmin);
          }
          
          for (const admin of admins) {
            console.log('Creating notification for admin:', admin._id);
            try {
              await Notification.create({
                recipient: admin._id,
                recipientModel: 'Admin',
                message: `New contact message from seller "${seller.sellerName}" regarding: ${req.body.subject}`,
                link: `/admin/contact-messages/${contact._id}`,
              });
              console.log('Notification created for admin:', admin._id);
            } catch (notifError) {
              console.error('Error creating notification for admin:', admin._id, notifError);
            }
          }
          console.log('Admin notifications created successfully');
        } else {
          console.log('Seller not found with ID:', req.body.sellerId);
        }
      } catch (notificationError) {
        console.error('Error in notification creation:', notificationError);
        // Don't fail the whole request if notifications fail
        console.log('Contact message saved but notifications failed');
      }
    } else {
      console.log('Message is not from seller or missing sellerId');
    }

    res.status(201).json({ message: 'Contact message saved successfully' });
  } catch (error) {
    console.error('Error in createContactMessage:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to save contact message', details: error.message });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    let messages;
    if (req.query.email) {
      messages = await Contact.find({ email: req.query.email }).sort({ createdAt: -1 });
    } else {
      messages = await Contact.find().sort({ createdAt: -1 });
    }
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve contact messages' });
  }
};

exports.respondToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;
    
    // Get the original message to check if it's from a seller
    const originalMessage = await Contact.findById(id);
    
    const updatedMessage = await Contact.findByIdAndUpdate(id, { response, status }, { new: true });

    // Create notification for seller if admin responded to a seller's message
    if (originalMessage && originalMessage.isFromSeller && originalMessage.sellerId && response) {
      await Notification.create({
        recipient: originalMessage.sellerId,
        recipientModel: 'Seller',
        message: `Admin has responded to your contact message regarding: "${originalMessage.subject}"`,
        link: `/seller/contact-messages/${id}`,
      });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact message' });
  }
};

exports.deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.status(200).json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact message' });
  }
};