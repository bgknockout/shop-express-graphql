const mongoose = require('mongoose')

const BranchSchema = mongoose.Schema({
    branch_name: {
        type: String,
        required: true,
        trim: true
    },  
    email: {    
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Ingresa un email correcto'
        ],
    },
    phone: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    providers: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Provider'
    }
})

module.exports = mongoose.model('Branch', BranchSchema)
