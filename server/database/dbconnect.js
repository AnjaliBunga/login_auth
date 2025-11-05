const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const dbconnect = async () => {
    try {
        const uri = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/login_auth';
        await mongoose.connect(uri, {
            autoIndex: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error?.message || error);
    }
}
module.exports = dbconnect;