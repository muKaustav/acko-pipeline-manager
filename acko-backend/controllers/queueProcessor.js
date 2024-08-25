const { Worker } = require('bullmq')
const mongoose = require('mongoose')
const Pipeline = require('../models/Pipeline')
const PipelineLog = require('../models/PipelineLog')
const CSVFile = require('../models/CSVFile')
const { exec } = require('child_process')
const util = require('util')
const path = require('path')
const fs = require('fs').promises
const { pipelineQueue, wsQueue, connection } = require('../utils/queueConfig')
const { redisClient } = require('../utils/redis')

const execPromise = util.promisify(exec)
const MAX_LINES_PER_CHUNK = 100

const MONGO_URI = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}`

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err))

const getTap = (sourceType) => {
    const taps = {
        mysql: 'tap-mysql',
        postgresql: 'tap-postgres',
        csv: 'tap-csv'
    }
    const tap = taps[sourceType.toLowerCase()]
    if (!tap) throw new Error(`Unsupported source type: ${sourceType}`)
    return tap
}

const getTarget = (destinationType) => {
    const targets = {
        mysql: 'target-mysql',
        postgresql: 'target-postgres',
        csv: 'target-csv'
    }
    const target = targets[destinationType.toLowerCase()]
    if (!target) throw new Error(`Unsupported destination type: ${destinationType}`)
    return target
}

const sendUpdate = async (message) => {
    await wsQueue.add('broadcast', message)
}

const createLog = async (pipelineId, level, message, details = {}) => {
    const log = new PipelineLog({
        pipeline: pipelineId,
        level,
        message,
        details
    })

    await log.save()
    await Pipeline.findByIdAndUpdate(pipelineId, { $push: { logs: log._id } })

    await sendUpdate({
        type: 'newPipelineLog',
        pipelineId: pipelineId.toString(),
        log: {
            level,
            message,
            timestamp: log.createdAt,
            details
        }
    })
}

const logOutput = async (pipelineId, level, type, output, details = {}) => {
    const lines = output.split('\n')
    const numChunks = Math.ceil(lines.length / MAX_LINES_PER_CHUNK)

    for (let i = 0; i < numChunks; i++) {
        const chunkLines = lines.slice(i * MAX_LINES_PER_CHUNK, (i + 1) * MAX_LINES_PER_CHUNK)
        const chunkContent = chunkLines.join('\n')
        await createLog(
            pipelineId,
            level,
            `${type} chunk ${i + 1}/${numChunks}`,
            { ...details, content: chunkContent }
        )
    }
}

const invalidateCache = async (pipelineId) => {
    await redisClient.del(`pipeline_${pipelineId}`)
    await redisClient.del('all_pipelines')
    await redisClient.del(`pipeline_logs_${pipelineId}`)
    console.log(`Cache invalidated for pipeline:${pipelineId} and all_pipelines`)
}

const worker = new Worker('pipeline-execution', async (job) => {
    const { pipelineId, runId } = job.data

    let pipeline = await Pipeline.findById(pipelineId)

    if (!pipeline) {
        throw new Error('Pipeline not found')
    }

    const runDir = path.join(__dirname, '..', 'etl', 'output', `run_${pipeline._id}_${runId}`)
    const meltanoProjectDir = path.join(__dirname, '..', 'etl')
    let inheritedPluginName
    let target

    try {
        pipeline.status = 'running'
        await pipeline.save()
        await createLog(pipeline._id, 'info', 'Pipeline execution started', { runId })

        await sendUpdate({
            type: 'pipelineUpdate',
            pipelineId: pipeline._id.toString(),
            status: 'running',
            lastRunAt: pipeline.lastRunAt
        })

        await job.updateProgress(10)

        const tap = getTap(pipeline.sourceType)
        target = getTarget(pipeline.destinationType)

        await fs.mkdir(runDir, { recursive: true })

        let meltanoCommand

        if (target === 'target-csv') {
            inheritedPluginName = `target-csv--${runId}`
            await execPromise(`meltano add loader ${inheritedPluginName} --inherit-from target-csv`, { cwd: meltanoProjectDir })
            await execPromise(`meltano config ${inheritedPluginName} set output_path ${runDir}`, { cwd: meltanoProjectDir })
            meltanoCommand = `meltano --log-level=debug run ${tap} ${inheritedPluginName}`
        } else {
            meltanoCommand = `meltano --log-level=debug run ${tap} ${target}`
        }

        console.log(`Executing command: ${meltanoCommand} in directory: ${meltanoProjectDir}`)
        await createLog(pipeline._id, 'info', 'Executing Meltano command', { command: meltanoCommand, directory: meltanoProjectDir, runId })

        await job.updateProgress(30)

        const { stdout, stderr } = await execPromise(meltanoCommand, {
            cwd: meltanoProjectDir,
            env: { ...process.env }
        })

        if (stdout) {
            await logOutput(pipeline._id, 'info', 'stdout', stdout, { runId })
        }

        if (stderr) {
            await logOutput(pipeline._id, 'warning', 'stderr', stderr, { runId })
        }

        if (stderr.includes('Traceback') || stderr.includes('Error:') || stderr.includes('CRITICAL')) {
            throw new Error(stderr)
        }

        await job.updateProgress(70)

        console.log('Pipeline executed successfully')
        await createLog(pipeline._id, 'info', 'Pipeline executed successfully', { runId })

        let responseData = { runId }

        if (target === 'target-csv') {
            const files = await fs.readdir(runDir)
            const csvFiles = files.filter(file => file.endsWith('.csv'))

            if (csvFiles.length === 0) {
                throw new Error('No CSV files generated for this run')
            }

            const fileIds = await Promise.all(csvFiles.map(async (file) => {
                const filePath = path.join(runDir, file)
                const content = await fs.readFile(filePath, 'utf8')

                const csvFile = new CSVFile({
                    pipelineId: pipeline._id,
                    runId,
                    filename: file,
                    content
                })

                await csvFile.save()
                return csvFile._id
            }))

            responseData.fileIds = fileIds
        }

        pipeline.status = 'completed'
        pipeline.lastRunAt = new Date()
        await pipeline.save()

        await job.updateProgress(100)

        await sendUpdate({
            type: 'pipelineUpdate',
            pipelineId: pipeline._id.toString(),
            status: 'completed',
            lastRunAt: pipeline.lastRunAt,
            result: responseData
        })


        // Invalidate cache
        await invalidateCache(pipeline._id)

        return responseData

    } catch (err) {
        console.error('Error running pipeline:', err)

        pipeline.status = 'failed'
        pipeline.lastRunAt = new Date()
        await pipeline.save()


        await createLog(pipeline._id, 'error', 'Pipeline execution failed', { error: err.message, runId })

        await sendUpdate({
            type: 'pipelineUpdate',
            pipelineId: pipeline._id.toString(),
            status: 'failed',
            lastRunAt: pipeline.lastRunAt,
            error: err.message
        })


        // Invalidate cache
        await invalidateCache(pipeline._id)

        throw err

    } finally {
        // Cleanup operations
        try {
            console.log('Starting cleanup operations')

            if (await fs.access(runDir).then(() => true).catch(() => false)) {
                await fs.rm(runDir, { recursive: true, force: true })
                console.log(`Removed run directory: ${runDir}`)
            }

            if (target === 'target-csv' && inheritedPluginName) {
                await execPromise(`meltano remove loader ${inheritedPluginName}`, { cwd: meltanoProjectDir })
                console.log(`Removed inherited plugin: ${inheritedPluginName}`)
            }

            console.log('Cleanup operations completed successfully')
        } catch (cleanupErr) {
            console.error('Error during cleanup operations:', cleanupErr)
            await createLog(pipeline._id, 'error', 'Cleanup operations failed', { error: cleanupErr.message, runId })
        }
    }
}, {
    connection,
    concurrency: 1,
})

console.log('Queue processor is running')