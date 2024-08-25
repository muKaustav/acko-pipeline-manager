require('dotenv').config()
const mongoose = require('mongoose')
const Pipeline = require('../models/Pipeline')
const CSVFile = require('../models/CSVFile')
const { getOrSetCache, invalidateCache } = require('../utils/redis')
const { SuccessResponse, ErrorResponse } = require('../utils/apiResponse')
const { pipelineQueue } = require('../utils/queueConfig')
const crypto = require('crypto')

let getPipelines = async (req, res) => {
    try {
        let pipelines = await getOrSetCache('all_pipelines', async () => {
            return await Pipeline.find()
        })
        return new SuccessResponse('Pipelines fetched', pipelines, 200).send(res)
    } catch (err) {
        console.error('Error fetching pipelines:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

let getPipeline = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return new ErrorResponse('Invalid pipeline ID', null, 400).send(res)
        }

        let pipeline = await getOrSetCache(`pipeline_${req.params.id}`, async () => {
            return await Pipeline.findById(req.params.id)
        })

        if (!pipeline) {
            return new ErrorResponse('Pipeline not found', null, 404).send(res)
        }

        return new SuccessResponse('Pipeline fetched', pipeline, 200).send(res)
    } catch (err) {
        console.error('Error fetching pipeline:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

let createPipeline = async (req, res, broadcast) => {
    try {
        console.log('Starting createPipeline function')
        let { name, description, sourceType, destinationType } = req.body

        console.log('Received request body:', req.body)

        if (!name || !description || !sourceType || !destinationType) {
            console.error('Missing required fields:', req.body)
            return new ErrorResponse('Please provide all required fields', null, 400).send(res)
        }

        if (sourceType.toLowerCase() === destinationType.toLowerCase()) {
            console.error('Source and destination cannot be the same:', req.body)
            return new ErrorResponse('Source and destination cannot be the same', null, 400).send(res)
        }

        if (!['mysql', 'postgresql'].includes(sourceType.toLowerCase()) ||
            !['mysql', 'postgresql', 'csv'].includes(destinationType.toLowerCase())) {
            console.error('Invalid source or destination:', req.body)
            return new ErrorResponse('Invalid source or destination', null, 400).send(res)
        }

        name = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
        console.log('Parsed pipeline name:', name)

        console.log('Creating new Pipeline document')
        let pipeline = new Pipeline({
            name,
            description,
            sourceType,
            destinationType,
            status: 'idle',
            lastRunAt: Date.now()
        })

        try {
            await pipeline.save()
            await invalidateCache('all_pipelines')
            console.log('Pipeline saved successfully:', pipeline)

            broadcast({
                type: 'pipelineUpdate',
                pipelineId: pipeline._id.toString(),
                status: 'idle',
                action: 'created'
            })
        } catch (err) {
            console.error('Error saving pipeline to database:', err)
            return new ErrorResponse('Error saving pipeline', err.message, 500).send(res)
        }

        console.log('createPipeline function completed successfully')
        return new SuccessResponse('Pipeline created', pipeline, 201).send(res)
    } catch (err) {
        console.error('Unhandled error in createPipeline:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

const updatePipeline = async (req, res, broadcast) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return new ErrorResponse('Invalid pipeline ID', null, 400).send(res)
        }

        let { sourceType, destinationType } = req.body

        if (sourceType && destinationType && sourceType.toLowerCase() === destinationType.toLowerCase()) {
            return new ErrorResponse('Source and destination cannot be the same', null, 400).send(res)
        }

        if (sourceType && !['mysql', 'postgresql'].includes(sourceType.toLowerCase())) {
            return new ErrorResponse('Invalid source type', null, 400).send(res)
        }

        if (destinationType && !['mysql', 'postgresql', 'csv'].includes(destinationType.toLowerCase())) {
            return new ErrorResponse('Invalid destination type', null, 400).send(res)
        }

        const pipeline = await Pipeline.findByIdAndUpdate(req.params.id, req.body, { new: true })
        await pipeline.save()

        await invalidateCache('all_pipelines')
        await invalidateCache(`pipeline_${req.params.id}`)

        broadcast({
            type: 'pipelineUpdate',
            pipelineId: pipeline._id.toString(),
            status: pipeline.status,
            action: 'updated'
        })

        return new SuccessResponse('Pipeline updated', pipeline, 200).send(res)
    } catch (err) {
        console.error('Error updating pipeline:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

const deletePipeline = async (req, res, broadcast) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return new ErrorResponse('Invalid pipeline ID', null, 400).send(res)
        }

        const pipeline = await Pipeline.findByIdAndDelete(req.params.id)

        if (!pipeline) {
            return new ErrorResponse('Pipeline not found', null, 404).send(res)
        }

        await invalidateCache('all_pipelines')
        await invalidateCache(`pipeline_${req.params.id}`)

        broadcast({
            type: 'pipelineUpdate',
            pipelineId: req.params.id,
            status: 'deleted',
            action: 'deleted'
        })

        return new SuccessResponse('Pipeline deleted', null, 200).send(res)
    } catch (err) {
        console.error('Error deleting pipeline:', err)
        return new ErrorResponse('Internal Server Error', err.message, 500).send(res)
    }
}

let runPipeline = async (req, res, broadcast) => {
    let { pipelineId } = req.params
    if (!mongoose.isValidObjectId(pipelineId)) {
        return new ErrorResponse('Invalid pipeline ID', null, 400).send(res)
    }

    let pipeline = await Pipeline.findById(pipelineId)
    if (!pipeline) {
        return new ErrorResponse('Pipeline not found', null, 404).send(res)
    }

    try {
        pipeline.status = 'queued'
        await pipeline.save()
        await invalidateCache(`pipeline_${pipelineId}`)

        broadcast({
            type: 'pipelineUpdate',
            pipelineId: pipeline._id.toString(),
            status: 'queued'
        })

        const job = await pipelineQueue.add('runPipeline', {
            pipelineId: pipeline._id.toString(),
            runId: crypto.randomBytes(16).toString('hex')
        })

        return new SuccessResponse('Pipeline execution queued', { pipelineId: pipeline._id.toString(), jobId: job.id }, 202).send(res)
    } catch (err) {
        console.error('Error queueing pipeline:', err)
        return new ErrorResponse('Error queueing pipeline', err.message, 500).send(res)
    }
}

let downloadCSV = async (req, res) => {
    try {
        const fileId = req.params.fileId
        const csvFile = await CSVFile.findById(fileId)

        if (!csvFile) {
            return new ErrorResponse('CSV file not found', null, 404).send(res)
        }

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename="${csvFile.filename}"`)
        res.send(csvFile.content)
    } catch (err) {
        console.error('Error downloading CSV:', err)
        return new ErrorResponse('Error downloading CSV', err.message, 500).send(res)
    }
}

module.exports = (broadcast) => ({
    getPipelines,
    getPipeline,
    createPipeline: (req, res) => createPipeline(req, res, broadcast),
    updatePipeline: (req, res) => updatePipeline(req, res, broadcast),
    deletePipeline: (req, res) => deletePipeline(req, res, broadcast),
    runPipeline: (req, res) => runPipeline(req, res, broadcast),
    downloadCSV
})