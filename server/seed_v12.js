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
    { name: 'Floor Cleaner', category: 'Household', price: 100, img: 'cleaning' },
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
        console.log('Connected to MongoDB for seeding v12 (Multi-User)...');

        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await B2BOrder.deleteMany({});
        await SalesData.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create 5 Retailers
        console.log('Creating 5 Retailers...');
        const retailers = [];
        for (let i = 1; i <= 5; i++) {
            const r = await User.create({
                name: `Retailer Shop ${i}`,
                email: `retailer${i}@gmail.com`,
                password: hashedPassword,
                role: 'retailer',
                phoneNumber: `987654321${i}`,
                address: `Market Lane ${i}, City`
            });
            retailers.push(r);

            // Add 30 items for each retailer
            for (let j = 0; j < 30; j++) {
                const template = productTemplates[j % productTemplates.length];
                await Product.create({
                    name: `${template.name} (${i})`,
                    price: template.price + Math.floor(Math.random() * 20),
                    basePrice: template.price,
                    stock: 20 + Math.floor(Math.random() * 50),
                    category: template.category,
                    sku: `RET-${i}-${j+100}`,
                    retailerId: r._id,
                    imageUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 100 + j) * 1234}?auto=format&fit=crop&q=80&w=400&sig=${i}-${j}`,
                    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    status: 'active'
                });
            }
        }

        // 2. Create 5 Wholesalers
        console.log('Creating 5 Wholesalers...');
        const wholesalers = [];
        for (let i = 1; i <= 5; i++) {
            const w = await User.create({
                name: `Global Wholesaler ${i}`,
                email: `wholesaler${i}@gmail.com`,
                password: hashedPassword,
                role: 'wholesaler',
                phoneNumber: `900000000${i}`,
                address: `Warehouse District ${i}`
            });
            wholesalers.push(w);

            // Add 30 bulk items for each wholesaler
            for (let j = 0; j < 30; j++) {
                const template = productTemplates[j % productTemplates.length];
                await Product.create({
                    name: `Bulk ${template.name} (${i})`,
                    price: Math.floor(template.price * 10 * 0.8),
                    basePrice: Math.floor(template.price * 10 * 0.7),
                    stock: 5000,
                    category: template.category,
                    sku: `WHO-${i}-${j+200}`,
                    retailerId: w._id,
                    imageUrl: `https://images.unsplash.com/photo-${1600000000000 + (i * 100 + j) * 4321}?auto=format&fit=crop&q=80&w=400&sig=${i}-${j+100}`,
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    status: 'active',
                    unitConversionFactor: 10
                });
            }
        }

        // 3. Create 5 Customers
        console.log('Creating 5 Customers...');
        for (let i = 1; i <= 5; i++) {
            await User.create({
                name: `End Customer ${i}`,
                email: `customer${i}@gmail.com`,
                password: hashedPassword,
                role: 'customer',
                phoneNumber: `912345678${i}`,
                address: `Residential Area ${i}`
            });
        }

        console.log('\n✅ SEEDING COMPLETE!');
        console.log('--- CREDENTIALS ---');
        console.log('Retailers: retailer1@gmail.com to retailer5@gmail.com');
        console.log('Wholesalers: wholesaler1@gmail.com to wholesaler5@gmail.com');
        console.log('Customers: customer1@gmail.com to customer5@gmail.com');
        console.log('PASSWORD FOR ALL: password123');
        console.log('-------------------');

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
