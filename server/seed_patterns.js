const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const SalesData = require('./models/SalesData');
const Order = require('./models/Order');
require('dotenv').config();

const RETAILER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6f7');
const CUSTOMER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6a1');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
        console.log('Connected to MongoDB for high-density AI seeding...');

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

        const productsSet = [
            { name: 'Basmati Rice (बासमती चावल) - 5kg', price: 650, basePrice: 600, stock: 45, category: 'Grains', sku: 'SKU001', retailerId: RETAILER_ID, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600' },
            { name: 'Toor Dal (तूर दाल) - 1kg', price: 140, basePrice: 120, stock: 12, category: 'Pulses', sku: 'SKU002', retailerId: RETAILER_ID, imageUrl: 'https://images.unsplash.com/photo-1599484435041-9457813a89e0?auto=format&fit=crop&q=80&w=600' },
            { name: 'Amul Butter (अमूल मक्खन) - 100g', price: 58, basePrice: 52, stock: 28, category: 'Dairy', sku: 'SKU003', retailerId: RETAILER_ID, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135f4df?auto=format&fit=crop&q=80&w=600' },
            { name: 'Britannia Bread (ब्रेड)', price: 45, basePrice: 38, stock: 4, category: 'Bakery', sku: 'SKU004', retailerId: RETAILER_ID, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600' }
        ];

        const created = [];
        for (const p of productsSet) {
            const prod = new Product({ ...p, expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) });
            await prod.save();
            created.push(prod);
        }

        console.log('Flooding database with patterned transactions for Apriori Detection...');

        // Pattern 1: High correlation between Rice (index 0) and Dal (index 1) - 40 transactions
        for (let i = 0; i < 40; i++) {
            const txId = new mongoose.Types.ObjectId().toString();
            const d = new Date(); d.setDate(d.getDate() - (i % 10));

            await new SalesData({ productId: created[0]._id, transactionId: txId, quantity: 1, priceAtSale: 650, retailerId: RETAILER_ID, timestamp: d }).save();
            await new SalesData({ productId: created[1]._id, transactionId: txId, quantity: 1, priceAtSale: 140, retailerId: RETAILER_ID, timestamp: d }).save();

            // Also create an actual order for the Growth Chart
            if (i < 20) {
                await new Order({ customerId: CUSTOMER_ID, retailerId: RETAILER_ID, items: [{ productId: created[0]._id, quantity: 1, priceAtPurchase: 650 }], totalAmount: 790, status: 'delivered', createdAt: d }).save();
            }
        }

        // Pattern 2: High correlation between Bread (index 3) and Butter (index 2) - 30 transactions
        for (let i = 0; i < 30; i++) {
            const txId = new mongoose.Types.ObjectId().toString();
            const d = new Date(); d.setDate(d.getDate() - (i % 5));

            await new SalesData({ productId: created[3]._id, transactionId: txId, quantity: 1, priceAtSale: 45, retailerId: RETAILER_ID, timestamp: d }).save();
            await new SalesData({ productId: created[2]._id, transactionId: txId, quantity: 1, priceAtSale: 58, retailerId: RETAILER_ID, timestamp: d }).save();
        }

        console.log('Seeding Complete! Bundles should now show Rice+Dal and Bread+Butter patterns.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
seedData();
