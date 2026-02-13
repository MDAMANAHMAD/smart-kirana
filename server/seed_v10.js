const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const B2BOrder = require('./models/B2BOrder');
const SalesData = require('./models/SalesData');

// Load env vars
dotenv.config({ path: __dirname + '/.env' });

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('❌ MONGODB_URI is undefined in .env file');
    process.exit(1);
}

const categories = ['Dairy', 'Bakery', 'Pantry', 'Snacks', 'Beverages', 'Personal Care', 'Household'];

const productTemplates = [
    { name: 'Amul Taaza Milk', category: 'Dairy', price: 54 },
    { name: 'Amul Butter 100g', category: 'Dairy', price: 56 },
    { name: 'Britannia Bread', category: 'Bakery', price: 45 },
    { name: 'Farm Fresh Eggs', category: 'Dairy', price: 42 },
    { name: 'Maggi Noodles', category: 'Snacks', price: 140 }, 
    { name: 'Coca Cola 750ml', category: 'Beverages', price: 45 },
    { name: 'Lays Classic', category: 'Snacks', price: 20 },
    { name: 'Tata Salt 1kg', category: 'Pantry', price: 28 },
    { name: 'Aashirvaad Atta', category: 'Pantry', price: 240 },
    { name: 'Fortune Oil 1L', category: 'Pantry', price: 165 },
    { name: 'Dove Soap', category: 'Personal Care', price: 60 },
    { name: 'Colgate Paste', category: 'Personal Care', price: 95 },
    { name: 'Basmati Rice', category: 'Pantry', price: 120 },
    { name: 'Sugar 1kg', category: 'Pantry', price: 44 },
    { name: 'Red Label Tea', category: 'Beverages', price: 130 },
    { name: 'Good Day Biscuits', category: 'Snacks', price: 30 },
    { name: 'Surf Excel 1kg', category: 'Household', price: 130 },
    { name: 'Vim Bar', category: 'Household', price: 20 },
    { name: 'Sprite 2L', category: 'Beverages', price: 95 },
    { name: 'Kissan Jam', category: 'Pantry', price: 150 }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to DB:', MONGO_URI);

        // 1. Clear Data
        console.log('🧹 Clearing old data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await B2BOrder.deleteMany({});
        await SalesData.deleteMany({});
        console.log('✅ Old Data Cleared.');

        const passwordHash = await bcrypt.hash('password123', 10);

        // 2. Create Wholesalers
        console.log('🏗️ Creating Wholesalers...');
        const wholesalers = [];
        const wholesalerData = [
            { name: 'Adarsh Wholesale', email: 'adarsh@gmail.com', pass: 'adarsh' },
            { name: 'Metro Cash & Carry', email: 'metro@gmail.com', pass: 'metro' }
        ];

        for (const w of wholesalerData) {
            const hash = await bcrypt.hash(w.pass, 10);
            const user = await User.create({
                name: w.name,
                email: w.email,
                password: hash,
                role: 'wholesaler',
                phoneNumber: '9000000000',
                address: 'Wholesale Market District'
            });
            wholesalers.push(user);
        }

        // 3. Create Retailers
        console.log('🏗️ Creating Retailers...');
        const retailers = [];
        const retailerData = [
            { name: 'Chinmay General Store', email: 'chinmay@gmail.com', pass: 'chinmay' },
            { name: 'Rahul Kirana', email: 'rahul@gmail.com', pass: 'rahul' },
            { name: 'Sneha Supermart', email: 'sneha@gmail.com', pass: 'sneha' }
        ];

        for (const r of retailerData) {
            const hash = await bcrypt.hash(r.pass, 10);
            const user = await User.create({
                name: r.name,
                email: r.email,
                password: hash,
                role: 'retailer',
                phoneNumber: '9000000001',
                address: 'Local Market Street'
            });
            retailers.push(user);
        }

        // 4. Create Customers
        console.log('🏗️ Creating Customers...');
        const customers = [];
        // Main Customer
        const mainCustomer = await User.create({
            name: 'Viram Customer',
            email: 'viram@gmail.com',
            password: await bcrypt.hash('viram', 10),
            role: 'customer',
            phoneNumber: '9876543210',
            address: 'Customer House, Sector 1'
        });
        customers.push(mainCustomer);

        // Dummy Customers
        for (let i = 1; i <= 20; i++) {
            customers.push(await User.create({
                name: `Customer ${i}`,
                email: `cust${i}@gmail.com`,
                password: passwordHash,
                role: 'customer',
                phoneNumber: `8000000${i < 10 ? '0' + i : i}`,
                address: `Area ${i}, City`
            }));
        }

        // 5. Create Wholesaler Products
        console.log('📦 Creating Wholesaler Products...');
        const allWholesaleProducts = [];
        for (const w of wholesalers) {
            for (let i = 0; i < 20; i++) { // 20 bulk products each
                const t = productTemplates[i % productTemplates.length];
                const p = await Product.create({
                    name: `Bulk ${t.name}`,
                    category: t.category,
                    price: Math.floor(t.price * 10 * 0.8), // Bulk price logic
                    basePrice: Math.floor(t.price * 10 * 0.8),
                    stock: 1000,
                    retailerId: w._id, // Owned by wholesaler
                    sku: `WHO-${w.name.substr(0, 3).toUpperCase()}-${i}`,
                    imageUrl: `https://source.unsplash.com/random/400x400/?${t.category}-${i}`,
                    status: 'active',
                    unitConversionFactor: 10,
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                });
                allWholesaleProducts.push(p);
            }
        }

        // 6. Create Retailer Products (Inventory) & B2B Orders
        console.log('📦 Creating Retailer Inventory & B2B Orders...');
        const allRetailerProducts = [];

        for (const r of retailers) {
            // A. Create Inventory
            const numProducts = 30 + Math.floor(Math.random() * 20); // 30-50 products
            const myProducts = [];

            for (let i = 0; i < numProducts; i++) {
                const t = productTemplates[i % productTemplates.length];
                const price = Math.floor(t.price * (0.9 + Math.random() * 0.2));

                const p = await Product.create({
                    name: t.name,
                    category: t.category,
                    price: price,
                    basePrice: price,
                    stock: 10 + Math.floor(Math.random() * 100),
                    retailerId: r._id,
                    sku: `RET-${r.name.substr(0, 3).toUpperCase()}-${i}`,
                    imageUrl: `https://source.unsplash.com/random/400x400/?groceries,${t.category.split(' ')[0]}`,
                    status: 'active',
                    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                });
                myProducts.push(p);
                allRetailerProducts.push(p);
            }

            // Low Stock Items
             for (let l = 0; l < 3; l++) {
                const t = productTemplates[(l + 10) % productTemplates.length];
                myProducts.push(await Product.create({
                    name: t.name,
                    category: t.category,
                    price: t.price,
                    basePrice: t.price,
                    stock: 3, 
                    retailerId: r._id,
                    sku: `RET-LOW-${l}`,
                    imageUrl: `https://source.unsplash.com/random/400x400/?${t.category.split(' ')[0]}`,
                    status: 'active',
                    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                }));
            }

            // Expiring Items
            for (let e = 0; e < 3; e++) {
                const t = productTemplates[(e + 15) % productTemplates.length];
                myProducts.push(await Product.create({
                    name: t.name,
                    category: t.category,
                    price: Math.floor(t.price * 0.5), 
                    basePrice: t.price,
                    stock: 15,
                    retailerId: r._id,
                    sku: `RET-EXP-${e}`,
                    imageUrl: `https://source.unsplash.com/random/400x400/?${t.category.split(' ')[0]}`,
                    status: 'active',
                    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
                }));
            }

            // B. Create B2B Orders (Restocking from Wholesaler)
            for (let b = 0; b < 5; b++) {
                const wholesaler = wholesalers[Math.floor(Math.random() * wholesalers.length)];
                // Find products owned by this wholesaler
                const wProducts = allWholesaleProducts.filter(p => p.retailerId.toString() === wholesaler._id.toString());
                
                if (wProducts.length > 0) {
                    const items = [];
                    const numItems = 2 + Math.floor(Math.random() * 3);
                    let totalB2B = 0;

                    for(let k=0; k<numItems; k++) {
                        const wp = wProducts[Math.floor(Math.random() * wProducts.length)];
                        const qty = 1 + Math.floor(Math.random() * 5);
                        items.push({
                            name: wp.name,
                            category: wp.category,
                            quantity: qty,
                            priceAtPurchase: wp.price,
                            wholesalerProductId: wp._id,
                            unitConversionFactor: wp.unitConversionFactor,
                            sku: wp.sku,
                            imageUrl: wp.imageUrl
                        });
                        totalB2B += wp.price * qty;
                    }

                    await B2BOrder.create({
                        retailerId: r._id,
                        wholesalerId: wholesaler._id,
                        items: items,
                        totalAmount: totalB2B,
                        status: ['pending', 'accepted', 'shipped', 'delivered'][Math.floor(Math.random() * 4)]
                    });
                }
            }

            // 7. Generate Orders & SalesData for this retailer
            console.log(`🛒 Generating Sales for ${r.name}...`);
            // 50 transactions per retailer
            for (let j = 0; j < 50; j++) {
                const randCust = customers[Math.floor(Math.random() * customers.length)];
                const orderItems = [];

                // Randomly select 1-5 items
                const itemCount = 1 + Math.floor(Math.random() * 4);
                
                // Group items to simulate "Market Basket"
                // e.g. If buying Bread, likely to buy Butter or Milk
                 // Simply picking random for now, but ensure validity
                for (let k = 0; k < itemCount; k++) {
                    const prod = myProducts[Math.floor(Math.random() * myProducts.length)];
                    if (!orderItems.find(x => x.productId === prod._id)) {
                        orderItems.push({
                            productId: prod._id,
                            name: prod.name,
                            quantity: 1 + Math.floor(Math.random() * 2),
                            priceAtPurchase: prod.price
                        });
                    }
                }

                if (orderItems.length === 0) continue;

                const totalAmount = orderItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
                
                // Spread dates over last 30 days
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 30)); 
                // Randomize time of day
                date.setHours(9 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));

                // Create Order
                const ord = await Order.create({
                    customerId: randCust._id,
                    retailerId: r._id,
                    items: orderItems,
                    totalAmount,
                    status: 'delivered',
                    createdAt: date,
                    updatedAt: date
                });

                // Create Sales Data
                const transactionId = ord._id.toString(); // Use Order ID as Transaction ID
                for (const item of orderItems) {
                    await SalesData.create({
                        productId: item.productId,
                        transactionId,
                        quantity: item.quantity,
                        priceAtSale: item.priceAtPurchase,
                        timestamp: date,
                        retailerId: r._id
                    });
                }
            }
        }

        console.log('\n📊 VERIFICATION:');
        console.log('----------------------------------------------------');
        console.log('Users:', await User.countDocuments());
        console.log('Products:', await Product.countDocuments());
        console.log('Orders (Customer):', await Order.countDocuments());
        console.log('B2B Orders (Wholesale):', await B2BOrder.countDocuments());
        console.log('SalesData Points:', await SalesData.countDocuments());
        console.log('----------------------------------------------------');

        console.log('\n✅ SEEDING COMPLETE! The cloud database is now fully populated.');
        console.log('\nCREDENTIALS (Login Required):');
        console.log('----------------------------------------------------');
        console.log('Customer: viram@gmail.com / viram');
        console.log('Retailer: chinmay@gmail.com / chinmay');
        console.log('Wholesaler: adarsh@gmail.com / adarsh');
        console.log('----------------------------------------------------');

        mongoose.connection.close();
    } catch (err) {
        console.error('❌ SEEDING FAILED:', err);
        mongoose.connection.close();
    }
};

seedDB();
