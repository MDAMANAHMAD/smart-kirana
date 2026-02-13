const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const B2BOrder = require('./models/B2BOrder');
const SalesData = require('./models/SalesData');

dotenv.config({ path: __dirname + '/.env' });

const MONGO_URI = process.env.MONGODB_URI;

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to Cloud DB');
        console.log('-----------------------------------');
        console.log('Users:      ', await User.countDocuments());
        console.log('Products:   ', await Product.countDocuments());
        console.log('Cust Orders:', await Order.countDocuments());
        console.log('Wholesale:  ', await B2BOrder.countDocuments());
        console.log('Sales Data: ', await SalesData.countDocuments());
        console.log('-----------------------------------');
        console.log('If all numbers > 0, data is successfully saved on cloud.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
