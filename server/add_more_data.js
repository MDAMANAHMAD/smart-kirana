const mongoose = require('mongoose');
const SalesData = require('./models/SalesData');
const Product = require('./models/Product');
require('dotenv').config();

const RETAILER_ID = new mongoose.Types.ObjectId('65a1f2e3c9e1a2b3c4d5e6f7');

const addData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-kirana');
    console.log('Connected to MongoDB to add more data...');

    const products = await Product.find({ retailerId: RETAILER_ID });
    if (products.length < 2) {
        console.log('Not enough products found');
        process.exit(1);
    }

    const rice = products.find(p => p.name.includes('Rice'));
    const dal = products.find(p => p.name.includes('Dal'));
    const butter = products.find(p => p.name.includes('Butter'));
    const bread = products.find(p => p.name.includes('Bread'));

    console.log('Adding 30 transactions of Bread + Butter...');
    for (let i = 0; i < 30; i++) {
        const txId = new mongoose.Types.ObjectId().toString();
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - (i % 30));

        await new SalesData({
            productId: bread._id,
            transactionId: txId,
            quantity: 1,
            priceAtSale: bread.price,
            retailerId: RETAILER_ID,
            timestamp: timestamp
        }).save();

        await new SalesData({
            productId: butter._id,
            transactionId: txId,
            quantity: 1,
            priceAtSale: butter.price,
            retailerId: RETAILER_ID,
            timestamp: timestamp
        }).save();
    }

    console.log('Adding 20 transactions of Maggi...');
    const maggi = products.find(p => p.name.includes('Maggi'));
    for (let i = 0; i < 20; i++) {
        const txId = new mongoose.Types.ObjectId().toString();
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - (i % 7));

        await new SalesData({
            productId: maggi._id,
            transactionId: txId,
            quantity: 2,
            priceAtSale: maggi.price,
            retailerId: RETAILER_ID,
            timestamp: timestamp
        }).save();
    }

    console.log('Data added successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

addData();
