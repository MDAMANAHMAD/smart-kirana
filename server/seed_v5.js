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
const WHOLESALER_1_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6b9');
const WHOLESALER_2_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6c0');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB for v5 full system seeding...');

    await User.deleteMany({});
    await Product.deleteMany({});
    await SalesData.deleteMany({});
    await Order.deleteMany({});
    await B2BOrder.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Wholesalers
    const wholesalers = [
      {
        _id: WHOLESALER_1_ID,
        name: 'Metro Bulk Suppliers',
        email: 'wholesaler@example.com',
        password: hashedPassword,
        role: 'wholesaler',
        phoneNumber: '9999988888',
        address: 'Wholesale Market, Sector 4, Bengaluru'
      },
      {
        _id: WHOLESALER_2_ID,
        name: 'Kirana Wholesale Hub',
        email: 'wholesaler2@example.com',
        password: hashedPassword,
        role: 'wholesaler',
        phoneNumber: '8888877777',
        address: 'APMC Yard, Yeshwanthpur, Bengaluru'
      }
    ];
    await User.insertMany(wholesalers);

    // 2. Create Retailer
    const retailer = new User({
      _id: RETAILER_ID,
      name: 'Ramesh Kirana Store',
      email: 'retailer@example.com',
      password: hashedPassword,
      role: 'retailer',
      phoneNumber: '9876543210',
      address: 'Shop 42, Outer Ring Road, Bengaluru'
    });
    await retailer.save();

    // 3. Create Customer
    const customer = new User({
      _id: CUSTOMER_ID,
      name: 'Aman (Customer)',
      email: 'customer@example.com',
      password: hashedPassword,
      role: 'customer',
      phoneNumber: '9123456789',
      address: 'HSR Layout, Bengaluru'
    });
    await customer.save();

    // 4. Products for Wholesaler 1
    const w1prods = [
      { name: 'Basmati Rice (Bulk)', price: 450, basePrice: 400, stock: 500, category: 'Grains', sku: 'W1-RICE-BK', retailerId: WHOLESALER_1_ID, specifications: '25kg Packaging', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { name: 'Refined Oil (Bulk Case)', price: 1200, basePrice: 1100, stock: 100, category: 'Oil', sku: 'W1-OIL-BK', retailerId: WHOLESALER_1_ID, specifications: '12x1L Bottles', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' }
    ];
    for (const p of w1prods) {
      await new Product({ ...p, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }).save();
    }

    // 5. Products for Wholesaler 2
    const w2prods = [
      { name: 'Sugar S-30 (Bulk)', price: 34, basePrice: 30, stock: 2000, category: 'Grocery', sku: 'W2-SUGAR-BK', retailerId: WHOLESALER_2_ID, specifications: '50kg Jute Bag', imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400' },
      { name: 'Toor Dal (Premium Bulk)', price: 110, basePrice: 95, stock: 300, category: 'Pulses', sku: 'W2-DAL-BK', retailerId: WHOLESALER_2_ID, specifications: '30kg Bag', imageUrl: 'https://images.unsplash.com/photo-1599484435041-9457813a89e0?w=400' }
    ];
    for (const p of w2prods) {
      await new Product({ ...p, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }).save();
    }

    // 6. Products for Retailer (including Hindi names for Voice AI)
    const retailerProducts = [
      { name: 'Basmati Rice (बासमती चावल)', price: 650, basePrice: 600, stock: 15, category: 'Grains', sku: 'R-RICE-01', retailerId: RETAILER_ID, isStarred: true, minStockThreshold: 10, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { name: 'Sugar (चीनी)', price: 50, basePrice: 45, stock: 8, category: 'Grocery', sku: 'R-SUGAR-01', retailerId: RETAILER_ID, isStarred: true, minStockThreshold: 20, imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400' },
      { name: 'Aashirvaad Atta (आशीर्वाद आटा)', price: 420, basePrice: 380, stock: 25, category: 'Grains', sku: 'R-ATTA-01', retailerId: RETAILER_ID, isStarred: false, minStockThreshold: 5, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' }
    ];

    const prodRefs = [];
    for (const p of retailerProducts) {
      const prod = await new Product({ ...p, expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) }).save();
      prodRefs.push(prod);
    }

    // 7. Seed Sales Data for last 30 days (Analytics visibility)
    console.log('Generating dummy sales for analytics...');
    for (let i = 0; i < 60; i++) {
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 30));
        const txId = new mongoose.Types.ObjectId().toString();
        const pRef = prodRefs[Math.floor(Math.random() * prodRefs.length)];
        
        await new SalesData({
            productId: pRef._id,
            transactionId: txId,
            quantity: Math.floor(Math.random() * 3) + 1,
            priceAtSale: pRef.price,
            timestamp: d,
            retailerId: RETAILER_ID
        }).save();
    }

    // 8. Seed some B2B Orders
    const b2bOrders = [
      {
        retailerId: RETAILER_ID,
        wholesalerId: WHOLESALER_1_ID,
        items: [{ name: 'Basmati Rice (Bulk)', quantity: 20, priceAtPurchase: 450, sku: 'W1-RICE-BK' }],
        totalAmount: 9000,
        status: 'pending'
      },
      {
        retailerId: RETAILER_ID,
        wholesalerId: WHOLESALER_2_ID,
        items: [{ name: 'Sugar S-30 (Bulk)', quantity: 10, priceAtPurchase: 34, sku: 'W2-SUGAR-BK' }],
        totalAmount: 340,
        status: 'accepted'
      }
    ];
    await B2BOrder.insertMany(b2bOrders);

    console.log('\n==========================================');
    console.log('  SMART-KIRANA V5 SEEDING COMPLETE');
    console.log('==========================================');
    console.log('Logins (Password is "password123"):');
    console.log('  Retailer:   retailer@example.com');
    console.log('  Wholesaler: wholesaler@example.com');
    console.log('  Wholesaler 2: wholesaler2@example.com');
    console.log('  Customer:   customer@example.com');
    console.log('==========================================\n');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};
seedData();
