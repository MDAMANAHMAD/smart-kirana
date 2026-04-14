const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

const seedCustomUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB. Seeding custom users...');

    // Users data
    const users = [
      {
        name: 'Adarsh',
        email: 'adarsh@gmail.com',
        password: 'adarsh',
        role: 'wholesaler',
        phoneNumber: '8000000001',
        address: 'Adarsh Wholesale Hub, Mumbai'
      },
      {
        name: 'Chinmay',
        email: 'chinmay@gmail.com',
        password: 'chinmay',
        role: 'retailer',
        phoneNumber: '9000000002',
        address: 'Chinmay Supermarket, Delhi'
      },
      {
        name: 'Viram',
        email: 'viram@gmail.com',
        password: 'viram',
        role: 'customer',
        phoneNumber: '7000000003',
        address: 'Viram Residence, Bangalore'
      }
    ];

    let wholesalerId = null;
    let retailerId = null;

    for (let u of users) {
      // Check if user exists
      let existingUser = await User.findOne({ email: u.email });
      if (existingUser) {
        console.log(`${u.email} already exists, dropping them...`);
        await User.deleteOne({ _id: existingUser._id });
        await Product.deleteMany({ retailerId: existingUser._id });
      }
      
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const newUser = await new User({
        ...u,
        password: hashedPassword
      }).save();
      
      if (u.role === 'wholesaler') wholesalerId = newUser._id;
      if (u.role === 'retailer') retailerId = newUser._id;
      
      console.log(`Created ${u.role}: ${u.email}`);
    }

    // Add colorful dummy products with varied images for Adarsh (Wholesaler)
    const images = [
      'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=500&q=80', // Rice/Grains
      'https://images.unsplash.com/photo-1596647413661-638df4832599?w=500&q=80', // Spices
      'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=500&q=80', // Oil/Liquid
      'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&q=80', // Breakfast/Cereals
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&q=80', // Beverages
      'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500&q=80'  // Snacks
    ];

    const catalog = [
      { name: 'Aashirvaad Atta', basePrice: 40, price: 45, stock: 1000, category: 'Grains' },
      { name: 'Red Chilli Powder', basePrice: 80, price: 90, stock: 500, category: 'Spices' },
      { name: 'Fortune Soya Oil', basePrice: 150, price: 165, stock: 400, category: 'Oil' },
      { name: 'Kelloggs Corn Flakes', basePrice: 200, price: 220, stock: 300, category: 'Breakfast' },
      { name: 'Nescafe Classic', basePrice: 250, price: 275, stock: 200, category: 'Beverages' },
      { name: 'Lays Magic Masala', basePrice: 15, price: 20, stock: 1000, category: 'Snacks' }
    ];

    console.log('Adding products for Wholesaler Adarsh...');
    for (let i = 0; i < catalog.length; i++) {
        const item = catalog[i];
        let p = await new Product({
            name: item.name,
            category: item.category,
            basePrice: item.basePrice * 10, // wholesale packs
            price: item.basePrice * 11,
            stock: item.stock,
            sku: `ADA-${item.name.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
            retailerId: wholesalerId,
            imageUrl: images[i],
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'active'
        }).save();

        // Also give 80% of these to Retailer Chinmay
        if (Math.random() < 0.8) {
            await new Product({
                name: item.name,
                category: item.category,
                basePrice: item.basePrice * 1.1,
                price: item.basePrice * 1.3,
                stock: Math.floor(Math.random() * 50) + 10,
                sku: `CHI-${item.name.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
                retailerId: retailerId,
                wholesalerSourceId: wholesalerId,
                wholesalerProductId: p._id,
                imageUrl: images[i],
                isStarred: Math.random() < 0.5,
                expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
                status: 'active'
            }).save();
        }
    }
    
    // Some unique products for Chinmay
    console.log('Adding some local products for Retailer Chinmay...');
    // Dairy products specifically for Retailer
    const dairyImages = [
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80', // Milk
        'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=500&q=80'  // Butter
    ];
    await new Product({
        name: 'Nandini GoodLife Milk',
        category: 'Dairy',
        basePrice: 25, price: 28, stock: 60,
        sku: `CHI-MIL-101`,
        retailerId: retailerId,
        imageUrl: dairyImages[0],
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active'
    }).save();
    
    await new Product({
        name: 'Amul Butter 500g',
        category: 'Dairy',
        basePrice: 200, price: 220, stock: 25,
        sku: `CHI-BUT-102`,
        retailerId: retailerId,
        imageUrl: dairyImages[1],
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        status: 'active'
    }).save();

    console.log('Custom Users and Inventory added successfully!');
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seedCustomUsers();
