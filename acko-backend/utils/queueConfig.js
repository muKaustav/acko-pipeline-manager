const { Queue } = require('bullmq')
const Redis = require('ioredis')

const connection = new Redis({
    port: process.env.REDIS_BROKER_PORT || 6380,
    host: process.env.REDIS_BROKER_HOST,
    password: process.env.REDIS_BROKER_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
})

const pipelineQueue = new Queue('pipeline-execution', { connection })
const wsQueue = new Queue('websocket-messages', { connection })

module.exports = {
    pipelineQueue,
    wsQueue,
    connection
}