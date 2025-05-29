const mongoose = require('mongoose');

const OvertimeEntrySchema = new mongoose.Schema({
    employee_no: {
        type: String,
        required: true,
    },
    employee_name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    inTime: {
        type: Date,
        required: true,
    },
    outTime: {
        type: Date,
        required: true,
    },
    isNightShift: {
        type: Boolean,
        default: false,
    },
    ot_normal_hours: {
        type: Number,
        default: 0,
    },
    ot_double_hours: {
        type: Number,
        default: 0,
    },
    ot_triple_hours: {
        type: Number,
        default: 0,
    },
    reason: {
        type: String,
        default: '',
    },
    confirmed_hours: {
        type: Number,
        default: 0
    },
    approval_stage: {
        type: String,
        enum: ['pending', 'approved(production)', 'final_approved(hr)'],
        default: 'pending',
    }

}, { timestamps: true });

module.exports = mongoose.model('OvertimeEntry', OvertimeEntrySchema);