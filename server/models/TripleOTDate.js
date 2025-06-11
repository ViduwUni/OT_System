const mongoose = require('mongoose');

const tripleOTDateSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('TripleOTDate', tripleOTDateSchema);