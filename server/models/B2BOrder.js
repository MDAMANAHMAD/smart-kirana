const mongoose = require('mongoose');

const B2BOrderSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  wholesalerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    name: String,
    category: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    priceAtPurchase: {
      type: Number,
      required: true
    },
    wholesalerProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    unitConversionFactor: Number,
    sku: String,
    imageUrl: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered', 'fulfilled', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('B2BOrder', B2BOrderSchema);
