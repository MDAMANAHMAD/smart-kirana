const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const SalesData = require('./models/SalesData');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB for re-seeding...');

    await User.deleteMany({});
    await Product.deleteMany({});
    await SalesData.deleteMany({});

    // Create Retailer
    const hashedRetailerPassword = await bcrypt.hash('retailer123', 10);
    const retailer = new User({
      name: 'किराना स्टोर मालिक',
      email: 'retailer@example.com',
      password: hashedRetailerPassword,
      role: 'retailer',
      phoneNumber: '9876543210',
      address: 'दुकान नंबर 5, मार्केट रोड, बेंगलुरु'
    });
    await retailer.save();

    // Create Customer
    const hashedCustomerPassword = await bcrypt.hash('customer123', 10);
    const customer = new User({
      name: 'अमन अहमद',
      email: 'customer@example.com',
      password: hashedCustomerPassword,
      role: 'customer',
      phoneNumber: '9123456789',
      address: 'बेंगलुरु'
    });
    await customer.save();

    // Create Hindi Products
    const products = [
      { name: 'बासमती चावल (5kg)', price: 650, basePrice: 600, stock: 45, category: 'अनाज', sku: 'SKU001', retailerId: retailer._id },
      { name: 'तूर दाल (1kg)', price: 120, basePrice: 110, stock: 8, category: 'दालें', sku: 'SKU002', retailerId: retailer._id },
      { name: 'अमूल मक्खन (100g)', price: 56, basePrice: 52, stock: 25, category: 'डेयरी', sku: 'SKU003', retailerId: retailer._id },
      { name: 'ब्रिटानिया ब्रेड', price: 40, basePrice: 38, stock: 5, category: 'बेकरी', sku: 'SKU004', retailerId: retailer._id },
      { name: 'मैगी नूडल्स (4-Pack)', price: 60, basePrice: 55, stock: 60, category: 'इंस्टेंट फूड', sku: 'SKU005', retailerId: retailer._id },
      { name: 'चीनी (1kg)', price: 45, basePrice: 40, stock: 100, category: 'किराना', sku: 'SKU006', retailerId: retailer._id },
      { name: 'नमक (1kg)', price: 20, basePrice: 18, stock: 150, category: 'किराना', sku: 'SKU007', retailerId: retailer._id },
      { name: 'हल्दी पाउडर (200g)', price: 35, basePrice: 30, stock: 40, category: 'मसाले', sku: 'SKU008', retailerId: retailer._id }
    ];

    const createdProdObjects = [];
    for (const p of products) {
      const prod = new Product({
        ...p,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      });
      await prod.save();
      createdProdObjects.push(prod);
    }

    console.log('Generating sales data for Apriori Visibility...');
    const now = new Date();
    // Simulate bundles: (Rice + Dal), (Bread + Butter), (Sugar + Tea/Milk)
    for (let i = 0; i < 40; i++) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - (i % 30));
        
        const tx1 = new mongoose.Types.ObjectId().toString();
        // Bundle 1: Rice & Dal
        await new SalesData({ productId: createdProdObjects[0]._id, transactionId: tx1, quantity: 1, priceAtSale: 650, timestamp, retailerId: retailer._id }).save();
        await new SalesData({ productId: createdProdObjects[1]._id, transactionId: tx1, quantity: 1, priceAtSale: 120, timestamp, retailerId: retailer._id }).save();

        const tx2 = new mongoose.Types.ObjectId().toString();
        // Bundle 2: Bread & Butter
        await new SalesData({ productId: createdProdObjects[3]._id, transactionId: tx2, quantity: 1, priceAtSale: 40, timestamp, retailerId: retailer._id }).save();
        await new SalesData({ productId: createdProdObjects[2]._id, transactionId: tx2, quantity: 1, priceAtSale: 56, timestamp, retailerId: retailer._id }).save();
    }

    console.log('Seeding completed with Hindi data!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seedData();
