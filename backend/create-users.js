require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = [
      {
        name: 'Giám Đốc Quang Phát',
        email: 'quangphat@giamdoc.com',
        password: 'quangphat',
        isAdmin: true,
        role: 'director',
      },
      {
        name: 'Kế Toán Quang Phát',
        email: 'quangphat@ketoan.com',
        password: 'quangphat',
        isAdmin: false,
        role: 'accountant',
      },
      {
        name: 'Sản Xuất Quang Phát',
        email: 'quangphat@sanxuat.com',
        password: 'quangphat',
        isAdmin: false,
        role: 'production',
      },
    ];

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create(user);
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }

    console.log('User seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
