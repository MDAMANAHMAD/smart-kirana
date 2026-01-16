const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const SalesData = require('./models/SalesData');
const Order = require('./models/Order');
const B2BOrder = require('./models/B2BOrder');
require('dotenv').config();

const RETAILER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6f7');
const CUSTOMER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6a1');
const WHOLESALER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6b9');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB for v4 seeding...');

    await User.deleteMany({});
    await Product.deleteMany({});
    await SalesData.deleteMany({});
    await Order.deleteMany({});
    await B2BOrder.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Wholesaler
    const wholesaler = new User({
      _id: WHOLESALER_ID,
      name: 'Global Wholesale Corp',
      email: 'wholesaler@example.com',
      password: hashedPassword,
      role: 'wholesaler',
      phoneNumber: '8888899999',
      address: 'Industrial Hub, Zone 7, Bengaluru'
    });
    await wholesaler.save();

    // 2. Create Retailer
    const retailer = new User({
      _id: RETAILER_ID,
      name: 'Smart Retailer',
      email: 'retailer@example.com',
      password: hashedPassword,
      role: 'retailer',
      phoneNumber: '9876543210',
      address: 'Shop 101, Residency Road, Bengaluru'
    });
    await retailer.save();

    // 3. Create Customer
    const customer = new User({
      _id: CUSTOMER_ID,
      name: 'Regular Customer',
      email: 'customer@example.com',
      password: hashedPassword,
      role: 'customer',
      phoneNumber: '9123456789',
      address: 'Electronic City, Bengaluru'
    });
    await customer.save();

    // 4. Products for Wholesaler
    const wholesaleProducts = [
      { name: 'Bulk Basmati Rice', price: 500, basePrice: 450, stock: 1000, category: 'Grains', sku: 'W-RICE-01', retailerId: WHOLESALER_ID, specifications: 'Bulk 25kg bags' },
      { name: 'Bulk Sugar', price: 35, basePrice: 30, stock: 5000, category: 'Grocery', sku: 'W-SUGAR-01', retailerId: WHOLESALER_ID, specifications: 'Bulk 50kg bags' },
      { name: 'Premium Tea Dust', price: 200, basePrice: 180, stock: 200, category: 'Beverages', sku: 'W-TEA-01', retailerId: WHOLESALER_ID, specifications: 'Bulk 5kg packs' }
    ];

    for (const p of wholesaleProducts) {
      await new Product({ ...p, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }).save();
    }

    // 5. Products for Retailer
    const retailerProducts = [
      { name: 'Basmati Rice', price: 650, basePrice: 600, stock: 20, category: 'Grains', sku: 'R-RICE-01', retailerId: RETAILER_ID, isStarred: true, minStockThreshold: 10 },
      { name: 'Sugar', price: 50, basePrice: 45, stock: 35, category: 'Grocery', sku: 'R-SUGAR-01', retailerId: RETAILER_ID, isStarred: true, minStockThreshold: 15 }
    ];

    const prodRefs = [];
    for (const p of retailerProducts) {
      const prod = await new Product({ ...p, expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) }).save();
      prodRefs.push(prod);
    }

    // 6. Generate Sales History for Retailer
    const now = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const txId = new mongoose.Types.ObjectId().toString();
        
        await new SalesData({
            productId: prodRefs[0]._id,
            transactionId: txId,
            quantity: Math.floor(Math.random() * 5) + 1,
            priceAtSale: 650,
            timestamp: d,
            retailerId: RETAILER_ID
        }).save();
    }

    console.log('Seed SUCCESS. Logins:');
    console.log('Retailer: retailer@example.com / password123');
    console.log('Wholesaler: wholesaler@example.com / password123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seedData();
