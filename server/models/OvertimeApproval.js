const mongoose = require("mongoose");

const OvertimeApprovalSchema = new mongoose.Schema({
    employee_no: { type: String, required: true },
    period_type: { type: String, enum: ["week", "month"], required: true },
    period_value: { type: String, required: true },
    confirmed_hours: { type: Number, default: 0 },
    approval_stage: { type: String, enum: ["pending", "approved_production", "final_approved_hr"], default: "pending" },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("OvertimeApproval", OvertimeApprovalSchema);