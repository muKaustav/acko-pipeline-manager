require('dotenv').config()
const mongoose = require('mongoose')

/**
 * @desc: Connect to MongoDB
 * @return: Promise<void>
 */
const connectMongoDB = async () => {
    const MONGO_URI = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`

    try {
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        console.log('MongoDB connected successfully')
    } catch (err) {
        console.error('MongoDB connection failed:', err.message)
        process.exit(1)
    }
}

/**
 * @desc: Disconnect from MongoDB
 * @return: Promise<void>
 */
const disconnectMongoDB = async () => {
    try {
        await mongoose.disconnect()
        console.log('MongoDB disconnected successfully')
    } catch (err) {
        console.error('Error disconnecting from MongoDB:', err.message)
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    await disconnectMongoDB()
    process.exit(0)
})

module.exports = { connectMongoDB, disconnectMongoDB }