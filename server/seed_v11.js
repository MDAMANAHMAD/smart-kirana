const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const B2BOrder = require('./models/B2BOrder');
const SalesData = require('./models/SalesData');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana';

const productTemplates = [
    { name: 'Basmati Rice', category: 'Grains', price: 120, img: 'rice' },
    { name: 'Toor Dal', category: 'Pulses', price: 150, img: 'pulses' },
    { name: 'Mustard Oil', category: 'Oils', price: 180, img: 'oil' },
    { name: 'Sugar', category: 'Pantry', price: 45, img: 'sugar' },
    { name: 'Salt', category: 'Pantry', price: 25, img: 'salt' },
    { name: 'Tea Leaves', category: 'Beverages', price: 300, img: 'tea' },
    { name: 'Coffee Powder', category: 'Beverages', price: 450, img: 'coffee' },
    { name: 'Wheat Atta', category: 'Grains', price: 400, img: 'flour' },
    { name: 'Maida', category: 'Grains', price: 60, img: 'flour' },
    { name: 'Besan', category: 'Grains', price: 90, img: 'chickpeas' },
    { name: 'Turmeric Powder', category: 'Spices', price: 200, img: 'turmeric' },
    { name: 'Red Chilli Powder', category: 'Spices', price: 250, img: 'chilli' },
    { name: 'Coriander Powder', category: 'Spices', price: 180, img: 'spices' },
    { name: 'Garam Masala', category: 'Spices', price: 500, img: 'spices' },
    { name: 'Soap Bar', category: 'Personal Care', price: 40, img: 'soap' },
    { name: 'Toothpaste', category: 'Personal Care', price: 90, img: 'toothpaste' },
    { name: 'Shampoo', category: 'Personal Care', price: 200, img: 'shampoo' },
    { name: 'Dishwash Gel', category: 'Household', price: 120, img: 'dishwash' },
    { name: 'Detergent Powder', category: 'Household', price: 150, img: 'laundry' },
    { name: 'Floor Cleaner', category: 'Household', size: 1, price: 100, img: 'cleaning' },
    { name: 'Biscuits', category: 'Snacks', price: 30, img: 'biscuits' },
    { name: 'Potato Chips', category: 'Snacks', price: 20, img: 'chips' },
    { name: 'Instant Noodles', category: 'Instant Food', price: 15, img: 'noodles' },
    { name: 'Tomato Ketchup', category: 'Pantry', price: 120, img: 'ketchup' },
    { name: 'Honey', category: 'Pantry', price: 250, img: 'honey' },
    { name: 'Green Tea', category: 'Beverages', price: 350, img: 'greentea' },
    { name: 'Peanut Butter', category: 'Pantry', price: 300, img: 'peanutbutter' },
    { name: 'Corn Flakes', category: 'Snacks', price: 200, img: 'cornflakes' },
    { name: 'Oats', category: 'Snacks', price: 180, img: 'oats' },
    { name: 'Olive Oil', category: 'Oils', price: 800, img: 'oliveoil' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding v11...');

        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await B2BOrder.deleteMany({});
        await SalesData.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create Users
        const retailer = await User.create({
            name: 'Main Retailer',
            email: 'retailer@gmail.com',
            password: hashedPassword,
            role: 'retailer',
            phoneNumber: '9876543210',
            address: 'Shop 1, Market St'
        });

        const wholesaler = await User.create({
            name: 'Main Wholesaler',
            email: 'wholesaler@gmail.com',
            password: hashedPassword,
            role: 'wholesaler',
            phoneNumber: '9000000000',
            address: 'Warehouse Block A'
        });

        const customer = await User.create({
            name: 'Main Customer',
            email: 'customer@gmail.com',
            password: hashedPassword,
            role: 'customer',
            phoneNumber: '9123456789',
            address: 'Apt 101, City'
        });

        console.log('Users created with password: password123');

        // Create 30 Retailer Products
        console.log('Creating 30 Retailer products...');
        for (let i = 0; i < 30; i++) {
            const template = productTemplates[i % productTemplates.length];
            await Product.create({
                name: `${template.name} ${i + 1}`,
                price: template.price + Math.floor(Math.random() * 20),
                basePrice: template.price,
                stock: 20 + Math.floor(Math.random() * 50),
                category: template.category,
                sku: `RET-${template.category.substring(0,3).toUpperCase()}-${i+100}`,
                retailerId: retailer._id,
                imageUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 123456}?auto=format&fit=crop&q=80&w=400&sig=${i}`,
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                status: 'active'
            });
        }

        // Create 30 Wholesaler Products
        console.log('Creating 30 Wholesaler products...');
        for (let i = 0; i < 30; i++) {
            const template = productTemplates[i % productTemplates.length];
            await Product.create({
                name: `Bulk ${template.name} ${i + 1}`,
                price: Math.floor(template.price * 10 * 0.8),
                basePrice: Math.floor(template.price * 10 * 0.7),
                stock: 1000,
                category: template.category,
                sku: `WHO-${template.category.substring(0,3).toUpperCase()}-${i+200}`,
                retailerId: wholesaler._id,
                imageUrl: `https://images.unsplash.com/photo-${1600000000000 + i * 654321}?auto=format&fit=crop&q=80&w=400&sig=${i+100}`,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                status: 'active',
                unitConversionFactor: 10
            });
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
