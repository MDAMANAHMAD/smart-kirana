const mongoose = require('mongoose');

const SalesDataSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    index: true,
    description: "Group items bought together for Market Basket Analysis (Apriori)"
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtSale: {
    type: Number,
    required: true,
    description: "Captured price at the moment of sale for trend analysis"
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    description: "Critical for Demand Forecasting (ARIMA/Regression)"
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: false
});

// Compound index for frequent queries in AI training
SalesDataSchema.index({ productId: 1, timestamp: -1 });

module.exports = mongoose.model('SalesData', SalesDataSchema);
