const mongoose = require('mongoose')

const CSVFile = new mongoose.Schema({
    pipelineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pipeline',
        required: true
    },
    runId: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('CSVFile', CSVFile)