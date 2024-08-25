require('dotenv').config()
const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const cors = require('cors')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const { Worker } = require('bullmq')

const TableRoute = require('./routes/Table')
const PipelineRouteFactory = require('./routes/Pipeline')
const PipelineLogRoute = require('./routes/PipelineLog')
const CSVFileRoute = require('./routes/CSVFile')

const { redisClient } = require('./utils/redis')
const { connectMongoDB } = require('./utils/mongo')
const { pipelineQueue, wsQueue, connection: redisConnection } = require('./utils/queueConfig')
const { SuccessResponse, ErrorResponse } = require('./utils/apiResponse')

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(compression())
app.use(morgan('combined'))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
})
app.use(limiter)

const wss = new WebSocket.Server({
    server,
    path: '/ws',
    verifyClient: (info, callback) => {
        const origin = info.origin || info.req.headers.origin
        callback(origin === process.env.FRONTEND_URL)
    },
})

const broadcast = (message) => {
    console.log('Broadcasting message:', message)
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    })
}

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established')
    ws.on('message', (message) => {
        console.log('Received message from client:', message)
    })
    ws.on('close', () => {
        console.log('WebSocket connection closed')
    })
})

app.get('/home', (req, res) => {
    return new SuccessResponse('Welcome to Acko Backend', null, 200).send(res)
})

app.use('/tables', TableRoute)
app.use('/pipelines', PipelineRouteFactory(broadcast))
app.use('/logs', PipelineLogRoute)
app.use('/files', CSVFileRoute)

app.get('*', (req, res) => {
    return new ErrorResponse('Route not found', null, 404).send(res)
})

const PORT = process.env.PORT || 8000

const startServer = async () => {
    try {
        await connectMongoDB()
        console.log('MongoDB connected successfully')

        // Connect to Redis if not already connected
        console.log('Redis cache status:', redisClient.status)

        if (redisClient.status !== 'connect' && redisClient.status !== 'connecting' && redisClient.status !== 'ready') {
            await redisClient.connect()
        }
        console.log('Redis cache connected successfully')

        // Set up WebSocket message worker
        const wsWorker = new Worker('websocket-messages', async (job) => {
            if (job.name === 'broadcast') {
                broadcast(job.data)
            }
        }, { connection: redisConnection })

        console.log('WebSocket message worker started')

        // Start the queue processor
        require('./controllers/queueProcessor')
        console.log('Queue processor started')

        // Set up BullMQ event listeners
        pipelineQueue.on('completed', async (job, result) => {
            await wsQueue.add('broadcast', {
                type: 'pipelineUpdate',
                pipelineId: job.data.pipelineId,
                status: 'completed',
                lastRunAt: jpb.data.lastRunAt,
                result,
            })
        })

        pipelineQueue.on('failed', async (job, error) => {
            await wsQueue.add('broadcast', {
                type: 'pipelineUpdate',
                pipelineId: job.data.pipelineId,
                status: 'failed',
                lastRunAt: jpb.data.lastRunAt,
                error: error.message,
            })
        })

        pipelineQueue.on('progress', async (job, progress) => {
            await wsQueue.add('broadcast', {
                type: 'pipelineUpdate',
                pipelineId: job.data.pipelineId,
                status: 'running',
                lastRunAt: jpb.data.lastRunAt,
                progress,
            })
        })

        server.listen(PORT, '0.0.0.0', () => {
            console.log(`HTTP Server is running on port ${PORT}`)
            console.log(`WebSocket Server is running on ws://0.0.0.0:${PORT}/ws`)
        })
    } catch (error) {
        console.error('Error starting server:', error)
        process.exit(1)
    }
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    // Application specific logging, throwing an error, or other logic here
})

startServer()