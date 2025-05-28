const mongoose = require('mongoose');

const overtimeEntrySchema = new mongoose.Schema({
    employee_no: { type: String, required: true },
    employee_name: { type: String, required: true },
    date: { type: Date, required: true },
    inTime: { type: String, required: true },
    outTime: { type: String, required: true },
    ot_normal_hours: { type: Number, default: 0 },
    ot_double_hours: { type: Number, default: 0 },
    ot_triple_hours: { type: Number, default: 0 },
    productionSupervisor_approved_hours: { type: Number, default: 0 },
    reason: { type: String, default: "" },
    productionManager_approval: { type: Boolean, default: false },
    hrManager_final_approval: { type: Boolean, default: false },
    isNightShift: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('OvertimeEntry', overtimeEntrySchema);