const express = require('express');
const router = express.Router();
const empController = require('../controllers/employeeController');

router.post('/', empController.createEmployee);
router.get('/', empController.getAllEmployees);
router.put('/:id', empController.updateEmployee);
router.delete('/:id', empController.deleteEmployee);

module.exports = router;