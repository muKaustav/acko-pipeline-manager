const mongoose = require('mongoose')

/**
    * @desc: Pipeline Schema
    * @type: Schema
    * @return: Pipeline Model
*/
const Pipeline = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        maxLength: 500,
        required: false,
    },
    sourceType: {
        type: String,
        enum: ['mysql', 'postgresql', 'json', 'csv'],
        required: true,
    },
    destinationType: {
        type: String,
        enum: ['mysql', 'postgresql', 'csv'],
        required: true,
    },
    status: {
        type: String,
        enum: ['idle', 'queued', 'running', 'completed', 'failed'],
        required: true,
    },
    lastRunAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true })

module.exports = mongoose.model('Pipeline', Pipeline)
