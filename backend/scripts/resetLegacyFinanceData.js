const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

dotenv.config();

const collectionsToDrop = ['transactions', 'debts'];

const main = async () => {
  await connectDB();

  const results = [];
  for (const collectionName of collectionsToDrop) {
    const exists = await mongoose.connection.db
      .listCollections({ name: collectionName })
      .hasNext();

    if (!exists) {
      results.push({ collectionName, dropped: false, reason: 'not_found' });
      continue;
    }

    await mongoose.connection.db.dropCollection(collectionName);
    results.push({ collectionName, dropped: true });
  }

  console.log(JSON.stringify({ results }, null, 2));
  process.exit(0);
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
