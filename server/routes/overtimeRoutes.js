const express = require('express');
const router = express.Router();
const controller = require('../controllers/overtimeController');

router.post('/bulk', controller.bulkCreateOvertimeEntries);
router.get('/monthly-report', controller.getMonthlyOTReport);

router.post('/', controller.createOvertimeEntry);
router.get('/', controller.getAllOvertimeEntries);
router.get('/:id', controller.getOvertimeEntryById);
router.put('/:id', controller.updateOvertimeEntry);
router.delete('/:id', controller.deleteOvertimeEntry);

module.exports = router;