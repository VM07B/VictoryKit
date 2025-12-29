// Load environment from root .env
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { config, connectDB, errorHandler, createRateLimiter } = require('../../../../shared');
const routes = require('./routes');

const app = express();
const PORT = config.ports.vulnscan;
const DB_NAME = config.mongodb.databases.vulnscan;

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => console.log(msg.trim()) } }));
app.use(createRateLimiter('standard'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vulnscan-api', timestamp: new Date().toISOString() });
});

app.use('/api/v1/vulnscan', routes);
app.use(errorHandler);

connectDB(DB_NAME)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 VulnScan API running on port ${PORT}`);
      console.log(`📦 Database: ${DB_NAME}`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to start VulnScan API:', error);
    process.exit(1);
  });

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
