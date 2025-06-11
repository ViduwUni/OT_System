const express = require('express');
const router = express.Router();
const tripleOTController = require('../controllers/tripleOTController');

router.get('/', tripleOTController.getAllTripleOTDates);
router.post('/', tripleOTController.addTripleOTDate);
router.delete('/:date', tripleOTController.deleteTripleOTDate);

module.exports = router;