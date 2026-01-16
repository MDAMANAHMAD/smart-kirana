const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  basePrice: {
    type: Number,
    required: true,
    description: "Standard price before dynamic adjustments"
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  minStockThreshold: {
    type: Number,
    default: 10,
    description: "Used for restocking alerts"
  },
  expiryDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  sku: {
    type: String,
    required: true,
    index: true
  },
  specifications: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  wholesalerSourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  wholesalerProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  unitConversionFactor: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
