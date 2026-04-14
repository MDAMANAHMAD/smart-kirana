const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const SalesData = require('./models/SalesData');
const Order = require('./models/Order');
const B2BOrder = require('./models/B2BOrder');
require('dotenv').config();

const RETAILERS_COUNT = 3;
const WHOLESALERS_COUNT = 2;
const CUSTOMERS_COUNT = 5;

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB. Wiping existing data...');

    await User.deleteMany({});
    await Product.deleteMany({});
    await SalesData.deleteMany({});
    await Order.deleteMany({});
    await B2BOrder.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Wholesalers
    const wholesalers = [];
    for (let i = 1; i <= WHOLESALERS_COUNT; i++) {
      const w = await new User({
        name: `Global Wholesaler ${i}`,
        email: `wholesaler${i}@example.com`,
        password: hashedPassword,
        role: 'wholesaler',
        phoneNumber: `888889990${i}`,
        address: `Industrial Hub, Zone ${i}, Bengaluru`
      }).save();
      wholesalers.push(w);
    }
    const defaultWholesaler = wholesalers[0];

    // 2. Create Retailers
    const retailers = [];
    for (let i = 1; i <= RETAILERS_COUNT; i++) {
        const r = await new User({
            name: `Smart Retailer ${i}`,
            email: `retailer${i}@example.com`,
            password: hashedPassword,
            role: 'retailer',
            phoneNumber: `987654320${i}`,
            address: `Shop ${100 + i}, Local Road, Bengaluru`
        }).save();
        retailers.push(r);
    }
    const defaultRetailer = retailers[0];

    // 3. Create Customers
    const customers = [];
    for (let i = 1; i <= CUSTOMERS_COUNT; i++) {
        const c = await new User({
            name: `Regular Customer ${i}`,
            email: `customer${i}@example.com`,
            password: hashedPassword,
            role: 'customer',
            phoneNumber: `912345670${i}`,
            address: `Apartment ${i}, Block B, Bengaluru`
        }).save();
        customers.push(c);
    }

    // 4. Products for Wholesalers (Large Catalog)
    const productCatalog = [
      { name: 'Basmati Rice', category: 'Grains', basePrice: 50, wStock: 5000, qtyPerPack: 10, unit: 'kg' },
      { name: 'Sona Masoori Rice', category: 'Grains', basePrice: 40, wStock: 6000, qtyPerPack: 25, unit: 'kg' },
      { name: 'Wheat Flour (Aashirvaad)', category: 'Grains', basePrice: 35, wStock: 2000, qtyPerPack: 10, unit: 'kg' },
      { name: 'Tur Dal', category: 'Pulses', basePrice: 120, wStock: 1000, qtyPerPack: 5, unit: 'kg' },
      { name: 'Moong Dal', category: 'Pulses', basePrice: 90, wStock: 1000, qtyPerPack: 5, unit: 'kg' },
      { name: 'Sugar', category: 'Grocery', basePrice: 35, wStock: 8000, qtyPerPack: 50, unit: 'kg' },
      { name: 'Salt (Tata)', category: 'Grocery', basePrice: 15, wStock: 2000, qtyPerPack: 50, unit: 'kg' },
      { name: 'Mustard Oil (Fortune)', category: 'Oil', basePrice: 140, wStock: 500, qtyPerPack: 15, unit: 'L' },
      { name: 'Sunflower Oil', category: 'Oil', basePrice: 110, wStock: 800, qtyPerPack: 15, unit: 'L' },
      { name: 'Tea Dust (Taj Mahal)', category: 'Beverages', basePrice: 450, wStock: 300, qtyPerPack: 5, unit: 'kg' },
      { name: 'Coffee Powder (Bru)', category: 'Beverages', basePrice: 600, wStock: 200, qtyPerPack: 1, unit: 'kg' },
      { name: 'Amul Butter', category: 'Dairy', basePrice: 400, wStock: 400, qtyPerPack: 5, unit: 'kg' },
      { name: 'Cheese Slices', category: 'Dairy', basePrice: 650, wStock: 200, qtyPerPack: 2, unit: 'kg' },
      { name: 'Maggi Noodles', category: 'Snacks', basePrice: 10, wStock: 10000, qtyPerPack: 100, unit: 'pcs' },
      { name: 'Oreo Biscuits', category: 'Snacks', basePrice: 20, wStock: 5000, qtyPerPack: 50, unit: 'pcs' },
      { name: 'Lays Chips', category: 'Snacks', basePrice: 15, wStock: 8000, qtyPerPack: 100, unit: 'pcs' },
      { name: 'Coca Cola', category: 'Beverages', basePrice: 35, wStock: 3000, qtyPerPack: 24, unit: 'pcs' },
      { name: 'Surf Excel Matic', category: 'Household', basePrice: 180, wStock: 1000, qtyPerPack: 10, unit: 'kg' },
      { name: 'Dettol Soap', category: 'Household', basePrice: 25, wStock: 4000, qtyPerPack: 50, unit: 'pcs' },
      { name: 'Colgate Toothpaste', category: 'Household', basePrice: 40, wStock: 3000, qtyPerPack: 24, unit: 'pcs' }
    ];

    const wholesalerProductsMap = {}; // { wId: [products] }
    
    for (let w of wholesalers) {
      wholesalerProductsMap[w._id] = [];
      const numProducts = Math.floor(productCatalog.length * 0.8); // 80% of catalog to each wholesaler
      const shuffled = [...productCatalog].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numProducts; i++) {
        const p = shuffled[i];
        const wp = await new Product({
          name: p.name,
          category: p.category,
          basePrice: p.basePrice * p.qtyPerPack,
          price: (p.basePrice * p.qtyPerPack) * 1.1, // 10% wholesale margin
          stock: p.wStock,
          sku: `W${w._id.toString().slice(-4)}-${p.name.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
          retailerId: w._id,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }).save();
        wholesalerProductsMap[w._id].push({ originalInfo: p, dbDoc: wp });
      }
    }

    // 5. Products for Retailers (Inventory)
    const retailerProductsMap = {};
    for (let r of retailers) {
       retailerProductsMap[r._id] = [];
       // Pick a random wholesaler for this retailer to source from mostly
       const sourceW = wholesalers[Math.floor(Math.random() * wholesalers.length)];
       const sourceProducts = wholesalerProductsMap[sourceW._id];
       
       for (let wpObj of sourceProducts) {
          // 90% chance to stock this product
          if (Math.random() < 0.9) {
             const wp = wpObj.dbDoc;
             const info = wpObj.originalInfo;
             const isLowStock = Math.random() < 0.2; // 20% products low stock
             
             const stockNeeded = isLowStock ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 100) + 20;

             const rp = await new Product({
                name: info.name,
                category: info.category,
                basePrice: info.basePrice,
                price: Math.round(info.basePrice * 1.25), // 25% retail margin
                stock: stockNeeded,
                sku: `R${r._id.toString().slice(-4)}-${info.name.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
                retailerId: r._id,
                wholesalerSourceId: sourceW._id,
                wholesalerProductId: wp._id,
                isStarred: Math.random() < 0.3, // 30% starred
                expiryDate: new Date(Date.now() + (Math.floor(Math.random() * 180) + 30) * 24 * 60 * 60 * 1000)
             }).save();
             retailerProductsMap[r._id].push(rp);
          }
       }
    }

    // 6. Generate Huge Sales History & Orders for DEFAULT Retailer for Analytics
    console.log('Generating sales data for Analytics (Past 90 Days)...');
    
    // For defaultRetailer
    const myProducts = retailerProductsMap[defaultRetailer._id];
    
    for (let day = 90; day >= 0; day--) {
       const todayDate = new Date();
       todayDate.setDate(todayDate.getDate() - day);
       
       // Simulate 5 to 20 transactions per day
       const transactionsToday = Math.floor(Math.random() * 15) + 5;
       
       for(let t=0; t<transactionsToday; t++) {
           const txId = new mongoose.Types.ObjectId().toString();
           
           // Pick 1 to 5 items per receipt
           const itemsCount = Math.floor(Math.random() * 5) + 1;
           const receiptItems = [];
           let orderTotal = 0;

           for(let j=0; j<itemsCount; j++) {
               const p = myProducts[Math.floor(Math.random() * myProducts.length)];
               const qty = Math.floor(Math.random() * 4) + 1; // 1 to 4 quantity
               const price = p.price;
               orderTotal += price * qty;
               
               receiptItems.push({
                   productId: p._id,
                   name: p.name,
                   quantity: qty,
                   priceAtPurchase: price
               });

               await new SalesData({
                    productId: p._id,
                    transactionId: txId,
                    quantity: qty,
                    priceAtSale: price,
                    timestamp: new Date(todayDate.getTime() + Math.random() * 8 * 60 * 60 * 1000), // Random time in that day
                    retailerId: defaultRetailer._id
                }).save();
           }

           // Only store Order history for the past 10 days to keep UI clean, but keep all SalesData for AI.
           if (day <= 10) {
               // Assign to random customer or null
               const cust = customers[Math.floor(Math.random() * customers.length)];
               
               await new Order({
                   customerId: cust._id,
                   retailerId: defaultRetailer._id,
                   items: receiptItems,
                   totalAmount: orderTotal,
                   status: Math.random() > 0.1 ? 'delivered' : 'pending',
                   createdAt: todayDate
               }).save();
           }
       }
    }

    // 7. B2B Orders Pipeline Simulation
    console.log('Simulating B2B Pipeline...');
    for (let r of retailers) {
         const w = wholesalers[Math.floor(Math.random() * wholesalers.length)];
         const wProds = wholesalerProductsMap[w._id];
         
         const b2bItemsCount = Math.floor(Math.random() * 4) + 2;
         const items = [];
         let total = 0;
         
         for(let j=0; j<b2bItemsCount; j++) {
            const prodObj = wProds[Math.floor(Math.random() * wProds.length)];
            const wp = prodObj.dbDoc;
            const qty = Math.floor(Math.random() * 5) + 1; // 1 to 5 packs
            total += wp.price * qty;
            items.push({
                wholesalerProductId: wp._id,
                name: wp.name,
                quantity: qty,
                priceAtPurchase: wp.price,
                unitConversionFactor: prodObj.originalInfo.qtyPerPack
            });
         }

         await new B2BOrder({
             retailerId: r._id,
             wholesalerId: w._id,
             items,
             totalAmount: total,
             status: ['pending', 'accepted', 'fulfilled'][Math.floor(Math.random() * 3)]
         }).save();
    }

    console.log('--------------------------------------------------');
    console.log('SEEDED MASSIVE DATA SUCCESSFULLY!');
    console.log('--------------------------------------------------');
    console.log('Logins (All use: password123)');
    console.log(`Default Retailer: ${defaultRetailer.email}`);
    console.log(`Default Wholesaler: ${defaultWholesaler.email}`);
    console.log(`Default Customer: ${customers[0].email}`);
    console.log(`You can also use retailer2@example.com, wholesaler2@example.com etc.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seedData();
