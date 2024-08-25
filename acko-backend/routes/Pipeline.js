const express = require('express')
const PipelineControllerFactory = require('../controllers/Pipeline')

const router = express.Router()

module.exports = (broadcast) => {
    const PipelineController = PipelineControllerFactory(broadcast)

    router.get('/', PipelineController.getPipelines)
    router.post('/', PipelineController.createPipeline)
    router.get('/download-csv/:fileId', PipelineController.downloadCSV)
    router.post('/run/:pipelineId', PipelineController.runPipeline)
    router.get('/:id', PipelineController.getPipeline)
    router.put('/:id', PipelineController.updatePipeline)
    router.delete('/:id', PipelineController.deletePipeline)

    return router
}