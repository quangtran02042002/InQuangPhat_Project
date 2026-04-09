const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const checkUsers = async () => {
    try {
        const users = await User.find({});
        console.log("USERS IN DB:", users.map(u => ({ email: u.email, isAdmin: u.isAdmin })));
        process.exit();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
