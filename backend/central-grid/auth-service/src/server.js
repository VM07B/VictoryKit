require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDatabase } = require('../../../shared/config/database');
const { errorHandler, notFoundHandler } = require('../../../shared/middleware/errorHandler.middleware');
const authRoutes = require('./routes/auth.routes');
const paymentRoutes = require('./routes/payment.routes');
const logger = require('../../../shared/utils/logger');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', {
  stream: { write: message => logger.http(message.trim()) }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payment', paymentRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'auth_db';

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase(MONGODB_URI, DB_NAME);

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Auth Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Database: ${DB_NAME}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
