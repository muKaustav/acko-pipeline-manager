const mongoose = require('mongoose')

/**
    * @desc: PipelineLog Schema
    * @type: Schema
    * @return: PipelineLog Model
 */
const PipelineLog = new mongoose.Schema({
    pipeline: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pipeline',
        required: true,
    },
    level: {
        type: String,
        enum: ['info', 'warning', 'error'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    details: {
        type: Object,
        required: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('PipelineLog', PipelineLog)