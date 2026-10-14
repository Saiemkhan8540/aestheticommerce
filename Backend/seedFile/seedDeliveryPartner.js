const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DeliveryPartner = require('../models/deliveryPartner.model');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDeliveryPartner = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECT);
        console.log('MongoDB connected');

        // Check if delivery partner already exists
        const existingPartner = await DeliveryPartner.findOne({ email: 'delivery@test.com' });

        if (existingPartner) {
            console.log('Test delivery partner already exists');
            process.exit(0);
        }

        // Create test delivery partner
        const deliveryPartner = await DeliveryPartner.create({
            name: 'Test Delivery Partner',
            email: 'delivery@test.com',
            password: 'test123',
            phone: '1234567890',
            isActive: true,
        });

        console.log('Test delivery partner created successfully:');
        console.log('Email: delivery@test.com');
        console.log('Password: test123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding delivery partner:', error);
        process.exit(1);
    }
};

seedDeliveryPartner();
