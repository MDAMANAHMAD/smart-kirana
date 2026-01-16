const express = require('express');
const router = express.Router();
const { getVelocityReport, getFinancials } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/velocity', auth, getVelocityReport);
router.get('/financials', auth, getFinancials);

module.exports = router;
