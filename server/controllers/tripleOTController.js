const TripleOTDate = require('../models/TripleOTDate');

exports.getAllTripleOTDates = async (req, res) => {
    try {
        const dates = await TripleOTDate.find().sort({ date: 1 });
        res.json(dates);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get triple OT dates' });
    }
};

exports.addTripleOTDate = async (req, res) => {
    const { date, description } = req.body;
    try {
        const exists = await TripleOTDate.findOne({ date });
        if (exists) {
            return res.status(400).json({ message: 'Date already exists' });
        }
        const newDate = new TripleOTDate({ date, description });
        await newDate.save();
        res.status(201).json(newDate);
    } catch (err) {
        res.status(500).json({ message: 'Failed to add triple OT date' });
    }
};

exports.deleteTripleOTDate = async (req, res) => {
    const { date } = req.params;
    try {
        await TripleOTDate.deleteOne({ date });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete triple OT date' });
    }
};