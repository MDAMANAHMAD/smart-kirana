const SalesData = require('../models/SalesData');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getVelocityReport = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const sales = await SalesData.aggregate([
      { $match: { retailerId: new mongoose.Types.ObjectId(req.user.id), timestamp: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$productId', totalSold: { $sum: '$quantity' } } },
      { $sort: { totalSold: -1 } }
    ]);

    // Attach product names
    const populatedSales = await Promise.all(sales.map(async (s) => {
      const product = await Product.findById(s._id);
      return {
        name: product?.name || 'Unknown',
        totalSold: s.totalSold,
        status: s.totalSold > 50 ? 'Fast-Moving' : (s.totalSold > 10 ? 'Normal' : 'Slow-Moving')
      };
    }));

    res.json(populatedSales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFinancials = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const sales = await SalesData.find({
      retailerId: req.user.id,
      timestamp: { $gte: startOfMonth }
    });

    const revenue = sales.reduce((acc, curr) => acc + (curr.quantity * curr.priceAtSale), 0);
    
    // Calculate potential loss from expired products
    const expiredProducts = await Product.find({
      retailerId: req.user.id,
      expiryDate: { $lt: new Date() },
      stock: { $gt: 0 }
    });
    
    const loss = expiredProducts.reduce((acc, curr) => acc + (curr.stock * curr.basePrice), 0);
    
    res.json({
      revenue,
      projectedRevenue: revenue * 1.2, // Simple projection
      loss,
      netProfit: revenue - loss
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
