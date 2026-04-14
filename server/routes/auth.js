const express = require('express');
const router = express.Router();
const { register, login, getWholesalers, getRetailers, forgotPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/wholesalers', getWholesalers);
router.get('/retailers', getRetailers);

module.exports = router;
