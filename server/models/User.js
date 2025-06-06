const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['administrator' ,'manager(hr)', 'supervisor(hr)', 'supervisor(production)', 'manager(production)'],
        required: true
    },
    created_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);