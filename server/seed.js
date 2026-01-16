const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const SalesData = require('./models/SalesData');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await SalesData.deleteMany({});

    // Create Retailer
    const hashedRetailerPassword = await bcrypt.hash('retailer123', 10);
    const retailer = new User({
      name: 'Kirana Store Owner',
      email: 'retailer@example.com',
      password: hashedRetailerPassword,
      role: 'retailer',
      phoneNumber: '9876543210',
      address: 'Shop No. 5, Market Road, Bengaluru'
    });
    await retailer.save();

    // Create Customer
    const hashedCustomerPassword = await bcrypt.hash('customer123', 10);
    const customer = new User({
      name: 'Aman Ahmad',
      email: 'customer@example.com',
      password: hashedCustomerPassword,
      role: 'customer',
      phoneNumber: '9123456789',
      address: 'Apt 201, Green View, Bengaluru'
    });
    await customer.save();

    // Create Products
    const products = [
      { name: 'Basmati Rice 5kg', price: 650, basePrice: 600, stock: 45, shelfLife: 365, category: 'Grains', sku: 'SKU001', retailerId: retailer._id },
      { name: 'Toor Dal 1kg', price: 120, basePrice: 110, stock: 8, shelfLife: 180, category: 'Pulses', sku: 'SKU002', retailerId: retailer._id },
      { name: 'Amul Butter 100g', price: 56, basePrice: 52, stock: 25, shelfLife: 30, category: 'Dairy', sku: 'SKU003', retailerId: retailer._id },
      { name: 'Britannia Bread', price: 40, basePrice: 38, stock: 5, shelfLife: 5, category: 'Bakery', sku: 'SKU004', retailerId: retailer._id },
      { name: 'Maggi Noodles 4-Pack', price: 60, basePrice: 55, stock: 60, shelfLife: 270, category: 'Instant Food', sku: 'SKU005', retailerId: retailer._id }
    ];

    const createdProducts = [];
    for (const p of products) {
      const prod = new Product({
        ...p,
        expiryDate: new Date(Date.now() + (p.shelfLife || 30) * 24 * 60 * 60 * 1000)
      });
      await prod.save();
      createdProducts.push(prod);
    }

    // Generate Mock Sales Data for ARIMA/Apriori
    console.log('Generating dummy sales data...');
    const now = new Date();
    for (let i = 0; i < 30; i++) { // 30 days of data
      const timestamp = new Date(now);
      timestamp.setDate(now.getDate() - i);
      
      // Random number of transactions per day
      const dailyTransactions = Math.floor(Math.random() * 5) + 3;
      
      for (let t = 0; t < dailyTransactions; t++) {
        const transactionId = new mongoose.Types.ObjectId().toString();
        // Randomly pick 1-3 products per transaction
        const itemsInTransaction = Math.floor(Math.random() * 3) + 1;
        
        for (let it = 0; it < itemsInTransaction; it++) {
          const randomProd = createdProducts[Math.floor(Math.random() * createdProducts.length)];
          const qty = Math.floor(Math.random() * 3) + 1;
          
          await new SalesData({
            productId: randomProd._id,
            transactionId,
            quantity: qty,
            priceAtSale: randomProd.price,
            timestamp,
            retailerId: retailer._id
          }).save();
        }
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
