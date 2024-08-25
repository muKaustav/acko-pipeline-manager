const Redis = require('ioredis')
const { promisify } = require('util')

let redisClient = new Redis({
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
})

let getAsync = promisify(redisClient.get).bind(redisClient)
let setAsync = promisify(redisClient.set).bind(redisClient)
let delAsync = promisify(redisClient.del).bind(redisClient)

const DEFAULT_EXPIRATION = 3600 // 1 hour

let getOrSetCache = async (key, cb, expiration = DEFAULT_EXPIRATION) => {
    try {
        let cachedData = await getAsync(key)
        if (cachedData != null) {
            return JSON.parse(cachedData)
        }

        const freshData = await cb()
        await setAsync(key, JSON.stringify(freshData), 'EX', expiration)

        return freshData
    } catch (error) {
        console.error('Redis cache error:', error)
        return cb()
    }
}

let invalidateCache = async (key) => {
    try {
        await delAsync(key)
    } catch (error) {
        console.error('Redis cache invalidation error:', error)
    }
}

module.exports = {
    redisClient,
    getOrSetCache,
    invalidateCache,
}