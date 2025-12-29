const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { config, connectDB, errorHandler, logger } = require('../../../../shared');
const routes = require('./routes');

const app = express();
const PORT = config.ports?.securecode || 4008;

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '100mb' }));
app.use(morgan('combined'));

// Routes
app.use('/api/v1/securecode', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'securecode-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB('securecode');
    app.listen(PORT, () => {
      logger.info(`🔐 SecureCode API running on port ${PORT}`);
      logger.info(`📍 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
