const express = require('express');
const router = express.Router();
const { register, login, getWholesalers } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/wholesalers', getWholesalers);

module.exports = router;
