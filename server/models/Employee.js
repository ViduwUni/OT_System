const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employee_no: { type: String, required: true, unique: true },
    employee_name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);