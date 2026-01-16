const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const B2BOrder = require('./models/B2BOrder');
const Order = require('./models/Order');
const SalesData = require('./models/SalesData');
require('dotenv').config();

const WHOLESALER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6b9');
const RETAILER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6f7');
const CUSTOMER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6a1');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB for Supply Chain V7 Seeding...');

    await User.deleteMany({});
    await Product.deleteMany({});
    await B2BOrder.deleteMany({});
    await Order.deleteMany({});
    await SalesData.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Users
    await User.insertMany([
      { _id: WHOLESALER_ID, name: 'Metro Bulk Hub', email: 'wholesaler@example.com', password: hashedPassword, role: 'wholesaler', phoneNumber: '9999911111', address: 'Bulk Hub, Bengaluru' },
      { _id: RETAILER_ID, name: 'Ramesh Store', email: 'retailer@example.com', password: hashedPassword, role: 'retailer', phoneNumber: '9876543210', address: 'Street 42, Bengaluru' },
      { _id: CUSTOMER_ID, name: 'Aman Customer', email: 'customer@example.com', password: hashedPassword, role: 'customer', phoneNumber: '9123456789', address: 'HSR, Bengaluru' }
    ]);

    // 2. Wholesaler Inventory (Bulk Factory Stock)
    const bulkyMaggi = new Product({
      name: 'Maggi Noodles (Bulk Carton)',
      price: 600, // Wholesaler's selling price per bulk unit
      basePrice: 500,
      stock: 1000,
      category: 'Noodles',
      sku: 'MG-CARTON-48',
      unitConversionFactor: 48,
      retailerId: WHOLESALER_ID,
      status: 'active',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1612927329910-449195044941?w=400'
    });
    await bulkyMaggi.save();

    const pureSugar = new Product({
      name: 'Sugar Premium (50kg Bulk)',
      price: 1800,
      basePrice: 1600,
      stock: 500,
      category: 'Grocery',
      sku: 'SG-BAG-50',
      unitConversionFactor: 50,
      retailerId: WHOLESALER_ID,
      status: 'active',
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400'
    });
    await pureSugar.save();

    // 3. Retailer Inventory (Small Quantity / Live / Draft)
    // One active item
    await new Product({
      name: 'Aashirvaad Atta (5kg)',
      price: 450,
      basePrice: 400,
      stock: 30,
      category: 'Grains',
      sku: 'R-ATTA-5',
      retailerId: RETAILER_ID,
      status: 'active',
      expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'
    }).save();

    // One DRAFT item (Purchased but not priced yet)
    await new Product({
      name: 'Tea Leaves (Bulk Box)',
      price: 2000, // Placeholder
      basePrice: 1800,
      stock: 40, // 40 units after conversion
      category: 'Beverage',
      sku: 'R-TEA-DRAFT',
      retailerId: RETAILER_ID,
      status: 'draft', // <--- DRAFT MODE
      wholesalerSourceId: WHOLESALER_ID,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      imageUrl: 'https://images.unsplash.com/photo-1544787210-22bb60761816?w=400'
    }).save();

    // 4. Seed Orders
    // B2B Order: Pending for Wholesaler
    await new B2BOrder({
      retailerId: RETAILER_ID,
      wholesalerId: WHOLESALER_ID,
      items: [{ name: 'Sugar Bag', quantity: 10, priceAtPurchase: 1800, sku: 'SG-BAG-50', wholesalerProductId: pureSugar._id, unitConversionFactor: 50 }],
      totalAmount: 18000,
      status: 'pending'
    }).save();

    // Customer Order: Pending for Retailer
    await new Order({
      customerId: CUSTOMER_ID,
      retailerId: RETAILER_ID,
      items: [{ productId: bulkyMaggi._id, name: 'Maggi Packet', quantity: 2, priceAtPurchase: 15 }], // Simulating bought items
      totalAmount: 30,
      status: 'pending'
    }).save();

    console.log('Supply Chain V7 (Draft/Active Flow) Seeding Complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};
seedData();
