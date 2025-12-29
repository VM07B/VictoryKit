const mongoose = require('mongoose');
const config = require('./index');

const connections = {};

const connectDB = async (dbName) => {
  if (connections[dbName]) {
    return connections[dbName];
  }

  try {
    const uri = `${config.mongodb.uri}/${dbName}`;
    
    const conn = await mongoose.createConnection(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    conn.on('connected', () => {
      console.log(`✅ MongoDB connected: ${dbName}`);
    });

    conn.on('error', (err) => {
      console.error(`❌ MongoDB error (${dbName}):`, err.message);
    });

    conn.on('disconnected', () => {
      console.log(`⚠️ MongoDB disconnected: ${dbName}`);
    });

    connections[dbName] = conn;
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed (${dbName}):`, error.message);
    process.exit(1);
  }
};

// Legacy support
const connectDatabase = async (uri, dbName) => {
  return connectDB(dbName);
};

const closeAll = async () => {
  for (const [name, conn] of Object.entries(connections)) {
    await conn.close();
    console.log(`🔌 Closed connection: ${name}`);
  }
};

process.on('SIGINT', async () => {
  await closeAll();
  process.exit(0);
});

module.exports = { connectDB, connectDatabase, closeAll, connections };
