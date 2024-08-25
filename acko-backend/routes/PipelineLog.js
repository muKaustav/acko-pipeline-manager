const express = require('express')
const PipelineLogController = require('../controllers/PipelineLog')

const router = express.Router()

router.get('/recent', PipelineLogController.getRecentLogs)
router.get('/level/:level', PipelineLogController.getLogsByLevel)
router.get('/pipelines/:pipelineId', PipelineLogController.getLogsForPipeline)
router.get('/:logId', PipelineLogController.getLog)
router.delete('/:logId', PipelineLogController.deleteLog)

module.exports = router