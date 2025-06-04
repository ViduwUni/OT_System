const express = require('express');
const router = express.Router();
const { ping, mongoStatus } = require('../controllers/connectionController');

router.get('/ping', ping);
router.get('/status', mongoStatus);

module.exports = router;