const Employee = require('../models/Employee');

// Create new employee
exports.createEmployee = async (req, res) => {
    try {
        const newEmp = new Employee(req.body);
        const saved = await newEmp.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all employees
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ employee_name: 1 });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update employee
exports.updateEmployee = async (req, res) => {
    try {
        const updated = await Employee.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};