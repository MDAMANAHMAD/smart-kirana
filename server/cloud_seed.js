const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const SalesData = require('./models/SalesData');
require('dotenv').config();

async function seedCloudData() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('<db_username>')) {
      console.error('❌ MONGODB_URI not configured properly in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash('password123', salt);

    console.log('--- Creating Users ---');
    
    // Clear existing to avoid duplicates if needed, but let's just find or create
    let wholesaler = await User.findOne({ email: 'wholesaler@test.com' });
    if (!wholesaler) {
      wholesaler = await User.create({ name: 'Metro Bulk Hub', email: 'wholesaler@test.com', password: hashedPw, role: 'wholesaler', address: 'Warehouse Block A', phoneNumber: '9999999991' });
    }

    let retailer = await User.findOne({ email: 'retailer@test.com' });
    if (!retailer) {
      retailer = await User.create({ name: 'Aman Retail Store', email: 'retailer@test.com', password: hashedPw, role: 'retailer', address: 'Market Street 12', phoneNumber: '9999999992' });
    }

    let customer = await User.findOne({ email: 'customer@test.com' });
    if (!customer) {
      customer = await User.create({ name: 'Test Customer', email: 'customer@test.com', password: hashedPw, role: 'customer', address: 'Home 101', phoneNumber: '9999999993' });
    }

    console.log(`Wholesaler ID: ${wholesaler._id}`);
    console.log(`Retailer ID: ${retailer._id}`);
    console.log(`Customer ID: ${customer._id}`);

    // 2. Create Products for Retailer
    console.log('--- Creating Products ---');
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    const products = [
      { name: 'Basmati Rice', category: 'Grains', price: 120, basePrice: 100, stock: 50, sku: 'RICE-001', retailerId: retailer._id, status: 'active', expiryDate: futureDate },
      { name: 'Sugar', category: 'Grocery', price: 45, basePrice: 38, stock: 15, sku: 'SUG-001', retailerId: retailer._id, status: 'active', minStockThreshold: 20, expiryDate: futureDate },
      { name: 'Refined Oil', category: 'Grocery', price: 160, basePrice: 140, stock: 8, sku: 'OIL-001', retailerId: retailer._id, status: 'active', minStockThreshold: 10, expiryDate: futureDate },
      { name: 'Daal (Pulses)', category: 'Grains', price: 110, basePrice: 90, stock: 30, sku: 'DAAL-001', retailerId: retailer._id, status: 'active', expiryDate: futureDate }
    ];

    await Product.deleteMany({ retailerId: retailer._id });
    const createdProducts = await Product.insertMany(products);

    // 3. Create Dummy Sales Data for Graphs (last 7 days)
    console.log('--- Generating Analytics Data ---');
    await Order.deleteMany({ retailerId: retailer._id });
    await SalesData.deleteMany({ retailerId: retailer._id });

    const txNumbers = 15;
    const days = 7;

    for (let i = 0; i < txNumbers; i++) {
        const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const qty = Math.floor(Math.random() * 5) + 1;
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * days));

        const order = new Order({
            customerId: customer._id,
            retailerId: retailer._id,
            items: [{ productId: randomProduct._id, name: randomProduct.name, quantity: qty, priceAtPurchase: randomProduct.price }],
            totalAmount: randomProduct.price * qty,
            status: 'delivered',
            createdAt: date
        });
        await order.save();

        const sales = new SalesData({
            productId: randomProduct._id,
            retailerId: retailer._id,
            quantity: qty,
            priceAtSale: randomProduct.price,
            transactionId: order._id.toString(),
            createdAt: date
        });
        await sales.save();
    }

    console.log('✅ SEEDING COMPLETE!');
    console.log('\nUse these credentials to login:');
    console.log('Retailer: retailer@test.com / password123');
    console.log('Wholesaler: wholesaler@test.com / password123');
    console.log('Customer: customer@test.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('❌ SEEDING FAILED:', err);
    process.exit(1);
  }
}

seedCloudData();
