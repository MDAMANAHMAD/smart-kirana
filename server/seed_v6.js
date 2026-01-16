const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const WholesaleProduct = require('./models/WholesaleProduct');
const SalesData = require('./models/SalesData');
const Order = require('./models/Order');
const B2BOrder = require('./models/B2BOrder');
require('dotenv').config();

const RETAILER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6f7');
const WHOLESALER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6b9');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB for Supply Chain V6 seeding...');

    await User.deleteMany({});
    await Product.deleteMany({});
    await WholesaleProduct.deleteMany({});
    await SalesData.deleteMany({});
    await Order.deleteMany({});
    await B2BOrder.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Wholesaler
    const wholesaler = new User({
      _id: WHOLESALER_ID,
      name: 'Kirana Bulk Distributors',
      email: 'wholesaler@example.com',
      password: hashedPassword,
      role: 'wholesaler',
      phoneNumber: '9998887776',
      address: 'Central Wholesale Yard'
    });
    await wholesaler.save();

    // 2. Create Retailer
    const retailer = new User({
      _id: RETAILER_ID,
      name: 'Modern Kirana',
      email: 'retailer@example.com',
      password: hashedPassword,
      role: 'retailer',
      phoneNumber: '9876543210',
      address: 'City Center'
    });
    await retailer.save();

    // 3. Create Wholesale Products (Bulk)
    const wholesaleItems = [
      {
        name: 'Maggi Noodles (Carton)',
        bulkPrice: 600,
        unitConversionFactor: 48, // 48 packets per carton
        minOrderQuantity: 1,
        category: 'Noodles',
        sku: 'W-MAGGI-BOX',
        wholesalerId: WHOLESALER_ID,
        imageUrl: 'https://images.unsplash.com/photo-1612927329910-449195044941?w=400'
      },
      {
        name: 'Sugar (50kg Bag)',
        bulkPrice: 1800,
        unitConversionFactor: 50, // 50kg per bag
        minOrderQuantity: 1,
        category: 'Grocery',
        sku: 'W-SUGAR-50K',
        wholesalerId: WHOLESALER_ID,
        imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400'
      }
    ];
    const wProds = await WholesaleProduct.insertMany(wholesaleItems);

    // 4. Create Retail Inventory (Units)
    // For Maggi: Retail Price = 600/48 * 1.2 = ~15 per packet
    const retailItems = [
      {
        name: 'Maggi Packet (Maggi पैकेट)',
        price: 15,
        basePrice: 12.5,
        stock: 96, // 2 Cartons already broken
        minStockThreshold: 20,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        category: 'Noodles',
        sku: 'R-MAGGI-SN',
        retailerId: RETAILER_ID,
        wholesalerSourceId: WHOLESALER_ID,
        wholesalerProductId: wProds[0]._id,
        imageUrl: 'https://images.unsplash.com/photo-1612927329910-449195044941?w=400',
        isStarred: true
      }
    ];
    await Product.insertMany(retailItems);

    console.log('Supply Chain V6 Seeding Complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};
seedData();
