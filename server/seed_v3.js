const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const SalesData = require('./models/SalesData');
const Order = require('./models/Order');
require('dotenv').config();

// FIXED IDs to prevent session loss on re-seed
const RETAILER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6f7');
const CUSTOMER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6a1');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB for re-seeding...');

    await User.deleteMany({});
    await Product.deleteMany({});
    await SalesData.deleteMany({});
    await Order.deleteMany({});

    // Create Retailer
    const hashedRetailerPassword = await bcrypt.hash('retailer123', 10);
    const retailer = new User({
      _id: RETAILER_ID,
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
      _id: CUSTOMER_ID,
      name: 'Aman Ahmad',
      email: 'customer@example.com',
      password: hashedCustomerPassword,
      role: 'customer',
      phoneNumber: '9123456789',
      address: 'Bengaluru'
    });
    await customer.save();

    // Reliable Product Images
    const products = [
      { 
        name: 'Basmati Rice (बासमती चावल) - 5kg', 
        price: 650, 
        basePrice: 600, 
        stock: 45, 
        category: 'Grains', 
        sku: 'SKU001', 
        retailerId: RETAILER_ID,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
        specifications: 'Premium long grain Biryani rice. Aged for 24 months for maximum aroma and non-sticky texture.'
      },
      { 
        name: 'Toor Dal (तूर दाल) - 1kg', 
        price: 140, 
        basePrice: 120, 
        stock: 12, 
        category: 'Pulses', 
        sku: 'SKU002', 
        retailerId: RETAILER_ID,
        imageUrl: 'https://images.unsplash.com/photo-1599484435041-9457813a89e0?auto=format&fit=crop&q=80&w=600',
        specifications: 'Unpolished Arhar Dal. Naturally high in protein and ethically sourced from local farms.'
      },
      { 
        name: 'Amul Butter (अमूल मक्खन) - 100g', 
        price: 58, 
        basePrice: 52, 
        stock: 28, 
        category: 'Dairy', 
        sku: 'SKU003', 
        retailerId: RETAILER_ID,
        imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135f4df?auto=format&fit=crop&q=80&w=600',
        specifications: 'Classic salted butter. Pasteurized and perfect for spreading on bread or cooking.'
      },
      { 
        name: 'Britannia Bread (ब्रेड)', 
        price: 45, 
        basePrice: 38, 
        stock: 4, 
        category: 'Bakery', 
        sku: 'SKU004', 
        retailerId: RETAILER_ID,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
        specifications: 'Freshly baked daily. Soft white bread with no artificial preservatives.'
      },
      { 
        name: 'Maggi Noodles (मैगी) - 4-Pack', 
        price: 60, 
        basePrice: 55, 
        stock: 65, 
        category: 'Instant Food', 
        sku: 'SKU005', 
        retailerId: RETAILER_ID,
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=600',
        specifications: 'Indias favorite 2-minute snack. Contains authentic Masala flavoring.'
      },
      { 
        name: 'Sugar (चीनी) - 1kg', 
        price: 48, 
        basePrice: 40, 
        stock: 120, 
        category: 'Grocery', 
        sku: 'SKU006', 
        retailerId: RETAILER_ID,
        imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80&w=600',
        specifications: 'Pure sulfur-less crystalline sugar. Refined for daily household use.'
      }
    ];

    const createdProds = [];
    for (const p of products) {
      const prod = new Product({
        ...p,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        minStockThreshold: 10
      });
      await prod.save();
      createdProds.push(prod);
    }

    console.log('Generating historical sales and orders for analytics...');
    const now = new Date();
    
    // Create some actual orders for the "Order Feed" graph
    for (let i = 0; i < 15; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (i % 7));
        
        const ord = new Order({
            customerId: CUSTOMER_ID,
            retailerId: RETAILER_ID,
            items: [{ productId: createdProds[0]._id, quantity: 1, priceAtPurchase: 650 }],
            totalAmount: 650,
            status: 'delivered',
            createdAt: d
        });
        await ord.save();

        // Also add to SalesData for forecast service
        const tx = new mongoose.Types.ObjectId().toString();
        await new SalesData({
            productId: createdProds[0]._id,
            transactionId: tx,
            quantity: 1,
            priceAtSale: 650,
            timestamp: d,
            retailerId: RETAILER_ID
        }).save();
    }

    // Add more variety for MBA (Apriori) visibility - (Rice + Dal) bundle
    for (let i = 0; i < 20; i++) {
        const tx = new mongoose.Types.ObjectId().toString();
        await new SalesData({ productId: createdProds[0]._id, transactionId: tx, quantity: 1, priceAtSale: 650, retailerId: RETAILER_ID, timestamp: now }).save();
        await new SalesData({ productId: createdProds[1]._id, transactionId: tx, quantity: 1, priceAtSale: 140, retailerId: RETAILER_ID, timestamp: now }).save();
    }

    console.log('Final Seeding Status: SUCCESS. Log in with retailer@example.com / retailer123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seedData();
