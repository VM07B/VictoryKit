const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDatabase = async (uri, dbName) => {
  try {
    const options = {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(uri, options);

    logger.info(`MongoDB connected successfully to database: ${dbName}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDatabase };
