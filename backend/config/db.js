const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotel_booking';

  try {
    // Attempt connecting to the configured MongoDB URI with a short timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✓ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`! Could not connect to MongoDB at "${uri}": ${error.message}`);

    // If local MongoDB is not running, provide seamless in-memory MongoDB fallback
    try {
      console.log('➜ Starting in-memory MongoDB server for instant zero-config run...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();

      const conn = await mongoose.connect(inMemoryUri);
      console.log(`✓ In-Memory MongoDB Connected at: ${inMemoryUri}`);
      return conn;
    } catch (fallbackError) {
      console.error('✗ Failed to start in-memory MongoDB fallback:', fallbackError.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
