const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createAdmin = async () => {
    try {
        const exist = await User.findOne({ email: 'admin@quangphat.com' });
        if (exist) {
            console.log("Admin exists. Setting isAdmin to true just in case.");
            exist.isAdmin = true;
            exist.password = '123456';
            await exist.save();
        } else {
            await User.create({
                name: 'Giam Doc',
                email: 'admin@quangphat.com',
                password: 'password123',
                isAdmin: true,
            });
            console.log("Admin created: admin@quangphat.com / password123");
        }
        process.exit();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
createAdmin();
