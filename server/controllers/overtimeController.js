const OvertimeEntry = require('../models/OvertimeEntry');
const OvertimeApproval = require("../models/OvertimeApproval");

// Create a new entry
exports.createOvertimeEntry = async (req, res) => {
    try {
        const newEntry = new OvertimeEntry(req.body);
        const saved = await newEntry.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all entries
exports.getAllOvertimeEntries = async (req, res) => {
    try {
        const entries = await OvertimeEntry.find().sort({ createdAt: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get entry by ID
exports.getOvertimeEntryById = async (req, res) => {
    try {
        const entry = await OvertimeEntry.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update entry
exports.updateOvertimeEntry = async (req, res) => {
    try {
        const updated = await OvertimeEntry.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Entry not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete entry
exports.deleteOvertimeEntry = async (req, res) => {
    try {
        const deleted = await OvertimeEntry.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Entry not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Grouped entry aggregation
exports.grouped = async (req, res) => {
    const period = req.query.period || "week";

    let groupStage;
    if (period === "month") {
        groupStage = {
            _id: {
                employee_no: "$employee_no",
                year: { $year: "$date" },
                month: { $month: "$date" }
            },
            total_ot_normal_hours: { $sum: "$ot_normal_hours" },
            total_ot_double_hours: { $sum: "$ot_double_hours" },
            total_ot_triple_hours: { $sum: "$ot_triple_hours" },
            count: { $sum: 1 }
        };
    } else {
        groupStage = {
            _id: {
                employee_no: "$employee_no",
                year: { $year: "$date" },
                week: { $week: "$date" }
            },
            total_ot_normal_hours: { $sum: "$ot_normal_hours" },
            total_ot_double_hours: { $sum: "$ot_double_hours" },
            total_ot_triple_hours: { $sum: "$ot_triple_hours" },
            count: { $sum: 1 }
        };
    }

    try {
        const groupedData = await OvertimeEntry.aggregate([
            { $match: { date: { $type: "date" } } },
            { $group: groupStage },
            {
                $sort: {
                    "_id.employee_no": 1,
                    "_id.year": 1,
                    ...(period === "month" ? { "_id.month": 1 } : { "_id.week": 1 }),
                }
            }
        ]);
        res.json(groupedData);
    } catch (err) {
        console.error("Aggregation error:", err.stack || err);
        res.status(500).json({ message: "Failed to fetch grouped overtime", error: err.message });
    }
};

// Approval/upsert grouped overtime
exports.approval = async (req, res) => {
    const { employee_no, period_type, period_value, confirmed_hours, approval_stage } = req.body;

    if (!employee_no || !period_type || !period_value) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const approvalDoc = await OvertimeApproval.findOneAndUpdate(
            { employee_no, period_type, period_value },
            { confirmed_hours, approval_stage, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json(approvalDoc);
    } catch (err) {
        res.status(500).json({ message: "Failed to update approval", error: err.message });
    }
};