const OvertimeEntry = require('../models/OvertimeEntry');

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

// Get monthly OT report
exports.getMonthlyOTReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Missing startDate or endDate' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const results = await OvertimeEntry.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            {
                $addFields: {
                    year: { $year: "$date" },
                    month: { $month: "$date" }
                }
            },
            {
                $group: {
                    _id: {
                        employee_no: "$employee_no",
                        employee_name: "$employee_name",
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    total_ot_normal_hours: { $sum: "$ot_normal_hours" },
                    total_ot_double_hours: { $sum: "$ot_double_hours" },
                    total_ot_triple_hours: { $sum: "$ot_triple_hours" },
                    total_confirmed_hours: { $sum: "$confirmed_hours" },
                    entries: { $push: "$$ROOT" }
                }
            },
            {
                $sort: {
                    "_id.employee_no": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    employee_no: "$_id.employee_no",
                    employee_name: "$_id.employee_name",
                    year: "$_id.year",
                    month: "$_id.month",
                    total_ot_normal_hours: 1,
                    total_ot_double_hours: 1,
                    total_ot_triple_hours: 1,
                    total_confirmed_hours: 1,
                    entries: 1
                }
            }
        ]);

        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Bulk import overtime entries (TEST)
exports.bulkCreateOvertimeEntries = async (req, res) => {
    try {
        const entries = req.body;

        if (!Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({ error: 'No entries provided' });
        }

        const saved = await OvertimeEntry.insertMany(entries);
        res.status(201).json(saved);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};