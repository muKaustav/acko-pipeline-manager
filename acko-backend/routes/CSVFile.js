const express = require('express')
const CSVFileController = require('../controllers/CSVFile')

const router = express.Router()

router.get('/:id', CSVFileController.getPipelineFiles)

module.exports = router