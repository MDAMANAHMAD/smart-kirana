const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductsByWholesaler,
  getMyProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  toggleStar,
  executeVoiceAction,
  getExpiryAlerts
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/', optionalAuth, getProducts);
router.get('/wholesaler/:wholesalerId', auth, getProductsByWholesaler);
router.get('/mine', auth, getMyProducts);
router.post('/', auth, createProduct);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

// New Phase 2 Routes
router.patch('/:id/star', auth, toggleStar);
router.post('/voice-action', auth, executeVoiceAction);
router.get('/expiry-alerts', auth, getExpiryAlerts);

module.exports = router;
