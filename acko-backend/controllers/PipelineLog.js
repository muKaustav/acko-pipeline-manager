const mongoose = require('mongoose')
const Pipeline = require('../models/Pipeline')
const PipelineLog = require('../models/PipelineLog')
const { getOrSetCache, invalidateCache } = require('../utils/redis')
const { SuccessResponse, ErrorResponse } = require('../utils/apiResponse')

const getLogsForPipeline = async (req, res) => {
    try {
        let { pipelineId } = req.params

        if (!mongoose.isValidObjectId(pipelineId)) {
            return new ErrorResponse('Invalid pipeline ID', null, 400).send(res)
        }

        let logs = await getOrSetCache(`pipeline_logs_${pipelineId}`, async () => {
            return await PipelineLog.find({ pipeline: pipelineId }).sort({ timestamp: -1 })
        }, 300) 

        return new SuccessResponse('Logs fetched successfully', logs, 200).send(res)
    } catch (err) {
        console.error('Error fetching logs:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

const getLog = async (req, res) => {
    try {
        let { logId } = req.params

        if (!mongoose.isValidObjectId(logId)) {
            return new ErrorResponse('Invalid log ID', null, 400).send(res)
        }

        let log = await getOrSetCache(`log_${logId}`, async () => {
            return await PipelineLog.findById(logId)
        }, 300) 

        if (!log) {
            return new ErrorResponse('Log not found', null, 404).send(res)
        }

        return new SuccessResponse('Log fetched successfully', log, 200).send(res)
    } catch (err) {
        console.error('Error fetching log:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

const deleteLog = async (req, res) => {
    try {
        let { logId } = req.params

        if (!mongoose.isValidObjectId(logId)) {
            return new ErrorResponse('Invalid log ID', null, 400).send(res)
        }

        let log = await PipelineLog.findByIdAndDelete(logId)

        if (!log) {
            return new ErrorResponse('Log not found', null, 404).send(res)
        }

        await Pipeline.findByIdAndUpdate(log.pipeline, { $pull: { logs: logId } })

        await invalidateCache(`log_${logId}`)
        await invalidateCache(`pipeline_logs_${log.pipeline}`)

        return new SuccessResponse('Log deleted successfully', null, 200).send(res)
    } catch (err) {
        console.error('Error deleting log:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

const getLogsByLevel = async (req, res) => {
    try {
        let { level } = req.params

        if (!['info', 'warning', 'error'].includes(level)) {
            return new ErrorResponse('Invalid log level', null, 400).send(res)
        }

        let logs = await getOrSetCache(`logs_by_level_${level}`, async () => {
            return await PipelineLog.find({ level }).sort({ timestamp: -1 })
        }, 300) 

        return new SuccessResponse('Logs fetched successfully', logs, 200).send(res)
    } catch (err) {
        console.error('Error fetching logs by level:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

const getRecentLogs = async (req, res) => {
    try {
        let logs = await getOrSetCache('recent_logs', async () => {
            let oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            return await PipelineLog.find({ timestamp: { $gte: oneDayAgo } }).sort({ timestamp: -1 })
        }, 60) 

        return new SuccessResponse('Recent logs fetched successfully', logs, 200).send(res)
    } catch (err) {
        console.error('Error fetching recent logs:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

module.exports = { getLogsForPipeline, getLog, deleteLog, getLogsByLevel, getRecentLogs }