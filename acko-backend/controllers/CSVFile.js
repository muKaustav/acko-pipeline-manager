let CSVFile = require('../models/CSVFile')
const { SuccessResponse, ErrorResponse } = require('../utils/apiResponse')

let getPipelineFiles = async (req, res) => {
    try {
        const files = await CSVFile.find({ pipelineId: req.params.id }).exec()
        return new SuccessResponse('Pipeline files fetched successfully', files).send(res)
    } catch (err) {
        console.error('Failed to fetch pipeline files:', err)
        return new ErrorResponse('Failed to fetch pipeline files').send(res)
    }
}

module.exports = { getPipelineFiles }