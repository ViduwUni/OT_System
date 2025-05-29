const express = require('express');
const router = express.Router();
const controller = require('../controllers/overtimeController');

router.get('/grouped', controller.grouped);
router.get('/approval', controller.approval);
router.post('/approval', controller.approval); 

router.post('/', controller.createOvertimeEntry);
router.get('/', controller.getAllOvertimeEntries);
router.get('/:id', controller.getOvertimeEntryById);
router.put('/:id', controller.updateOvertimeEntry);
router.delete('/:id', controller.deleteOvertimeEntry);

module.exports = router;