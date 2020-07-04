const mongoose = require('mongoose')

const ProviderSchema = mongoose.Schema({
    provider_name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String
    },
    info: {
    	type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Provider', ProviderSchema)
