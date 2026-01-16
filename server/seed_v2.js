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
      address: 'Bengaluru'
    });
    await customer.save();

    // Create Hinglish/Hindi Products with images and specs
    const products = [
      { 
        name: 'Basmati Rice (बासमती चावल) - 5kg', 
        price: 650, 
        basePrice: 600, 
        stock: 45, 
        category: 'Grains', 
        sku: 'SKU001', 
        retailerId: retailer._id,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
        specifications: 'Premium quality long grain rice, Aged for 2 years, High aroma.'
      },
      { 
        name: 'Toor Dal (तूर दाल) - 1kg', 
        price: 120, 
        basePrice: 110, 
        stock: 8, 
        category: 'Pulses', 
        sku: 'SKU002', 
        retailerId: retailer._id,
        imageUrl: 'https://images.unsplash.com/photo-1585996850221-3375ced0172c?auto=format&fit=crop&q=80&w=400',
        specifications: 'Unpolished dal, rich in protein, naturally grown.'
      },
      { 
        name: 'Amul Butter (अमूल मक्खन) - 100g', 
        price: 56, 
        basePrice: 52, 
        stock: 25, 
        category: 'Dairy', 
        sku: 'SKU003', 
        retailerId: retailer._id,
        imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135f4df?auto=format&fit=crop&q=80&w=400',
        specifications: 'Pure pasteurized salted butter.'
      },
      { 
        name: 'Britannia Bread (ब्रेड)', 
        price: 40, 
        basePrice: 38, 
        stock: 5, 
        category: 'Bakery', 
        sku: 'SKU004', 
        retailerId: retailer._id,
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
        specifications: 'Freshly baked white bread, extra soft.'
      },
      { 
        name: 'Maggi Noodles (मैगी) - 4-Pack', 
        price: 60, 
        basePrice: 55, 
        stock: 60, 
        category: 'Instant Food', 
        sku: 'SKU005', 
        retailerId: retailer._id,
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=400',
        specifications: '2-minute masala instant noodles.'
      },
      { 
        name: 'Sugar (चीनी) - 1kg', 
        price: 45, 
        basePrice: 40, 
        stock: 100, 
        category: 'Grocery', 
        sku: 'SKU006', 
        retailerId: retailer._id,
        imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80&w=400',
        specifications: 'White refined crystalline sugar.'
      }
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

    console.log('Generating sales data for predictions...');
    const now = new Date();
    for (let i = 0; i < 60; i++) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - (i % 30));
        
        const tx1 = new mongoose.Types.ObjectId().toString();
        await new SalesData({ productId: createdProdObjects[0]._id, transactionId: tx1, quantity: 1, priceAtSale: 650, timestamp, retailerId: retailer._id }).save();
        await new SalesData({ productId: createdProdObjects[1]._id, transactionId: tx1, quantity: 1, priceAtSale: 120, timestamp, retailerId: retailer._id }).save();
    }

    console.log('Seeding completed with Hinglish data and images!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seedData();
