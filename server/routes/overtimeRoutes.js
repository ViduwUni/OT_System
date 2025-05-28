const express = require('express');
const router = express.Router();
const overtimeController = require('../controllers/overtimeController');

router.post('/', overtimeController.createEntry);
router.get('/', overtimeController.getAllEntries);
router.get('/report', overtimeController.getMonthlyReport);
router.get('/:id', overtimeController.getEntryById);
router.put('/:id', overtimeController.updateEntry);
router.delete('/:id', overtimeController.deleteEntry);

module.exports = router;