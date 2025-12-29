// Load environment from root .env
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { config, connectDB, errorHandler, createRateLimiter } = require('../../../../shared');
const routes = require('./routes');

const app = express();
const PORT = config.ports.phishguard;
const DB_NAME = config.mongodb.databases.phishguard;

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: msg => console.log(msg.trim()) } }));
app.use(createRateLimiter('standard'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'phishguard-api', timestamp: new Date().toISOString() });
});

app.use('/api/v1/phishguard', routes);
app.use(errorHandler);

connectDB(DB_NAME)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 PhishGuard API running on port ${PORT}`);
      console.log(`📦 Database: ${DB_NAME}`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to start PhishGuard API:', error);
    process.exit(1);
  });

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
