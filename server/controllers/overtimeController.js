const OvertimeEntry = require('../models/OvertimeEntry');

// Create new OT entry
exports.createEntry = async (req, res) => {
    try {
        const newEntry = new OvertimeEntry(req.body);
        const saved = await newEntry.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all entries (optional filtering)
exports.getAllEntries = async (req, res) => {
    try {
        const filter = req.query || {};
        const entries = await OvertimeEntry.find(filter).sort({ date: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single entry by ID
exports.getEntryById = async (req, res) => {
    try {
        const entry = await OvertimeEntry.findById(req.params.id);
        if (!entry) return res.status(404).json({ error: 'Not found' });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update entry (e.g. for approvals)
exports.updateEntry = async (req, res) => {
    try {
        const updated = await OvertimeEntry.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete entry
exports.deleteEntry = async (req, res) => {
    try {
        await OvertimeEntry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Aggregated OT report
exports.getMonthlyReport = async (req, res) => {
    try {
        const start = new Date(req.query.start);
        const end = new Date(req.query.end);

        const report = await OvertimeEntry.aggregate([
            {
                $match: {
                    date: { $gte: start, $lte: end },
                    hrManager_final_approval: true
                }
            },
            {
                $group: {
                    _id: "$employee_no",
                    employee_name: { $first: "$employee_name" },
                    totalNormalOT: { $sum: "$ot_normal_hours" },
                    totalDoubleOT: { $sum: "$ot_double_hours" },
                    totalTripleOT: { $sum: "$ot_triple_hours" },
                    nightShifts: {
                        $sum: { $cond: ["$isNightShift", 1, 0] }
                    },
                    entries: { $push: "$$ROOT" }
                }
            },
            { $sort: { employee_name: 1 } }
        ]);

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};