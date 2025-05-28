const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);


// Example: Only manager(hr) and supervisor(hr) can access this
router.get('/hr-area', verifyToken, checkRole('manager(hr)', 'supervisor(hr)'), (req, res) => {
    res.json({ message: `Welcome ${req.user.role} to the HR area.` });
});

// Example: All logged in users
router.get('/dashboard', verifyToken, (req, res) => {
    res.json({ message: `Welcome ${req.user.role} to the dashboard.` });
});

module.exports = router;