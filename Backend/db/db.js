const mongoose = require('mongoose');

async function connectDB() {
  const dbUri = process.env.DB_CONNECT;

  if (!dbUri) {
    console.error('CRITICAL: DB_CONNECT is not defined in environment variables.');
    process.exit(1);
  }

  console.log('Attempting to connect to MongoDB...');

  try {
    await mongoose.connect(dbUri, {
      // Robust connection options to prevent idle disconnects
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 50, // Maintain up to 50 socket connections
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // In production, you might want to retry or exit
    // process.exit(1);
  }

  // Handle connection events
  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected. Attempting to reconnect...');
  });
}

module.exports = connectDB;