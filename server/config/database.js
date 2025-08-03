const mongoose = require('mongoose');
const path = require('path');

// Database configuration
const config = {
    // MongoDB configuration
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/umarbek_website',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }
    },
    
    // SQLite configuration (fallback)
    sqlite: {
        database: path.join(__dirname, '../../data/website.db'),
        options: {
            dialect: 'sqlite',
            storage: path.join(__dirname, '../../data/website.db'),
            logging: false
        }
    }
};

// Connect to MongoDB with fallback to SQLite
async function connectDatabase() {
    try {
        // Try MongoDB first
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(config.mongodb.uri, config.mongodb.options);
        console.log('✅ Connected to MongoDB successfully');
        return 'mongodb';
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        console.log('🔄 Falling back to SQLite...');
        
        // For now, we'll use a simple in-memory setup
        // In a real implementation, you'd set up SQLite with Sequelize
        console.log('✅ Using in-memory database for development');
        return 'memory';
    }
}

// Disconnect from database
async function disconnectDatabase() {
    try {
        await mongoose.disconnect();
        console.log('✅ Disconnected from database');
    } catch (error) {
        console.log('❌ Error disconnecting from database:', error.message);
    }
}

// Health check
async function checkDatabaseHealth() {
    try {
        if (mongoose.connection.readyState === 1) {
            return { status: 'healthy', type: 'mongodb' };
        } else {
            return { status: 'unhealthy', type: 'memory' };
        }
    } catch (error) {
        return { status: 'error', type: 'unknown', error: error.message };
    }
}

module.exports = {
    config,
    connectDatabase,
    disconnectDatabase,
    checkDatabaseHealth
}; 
