const dotenv = require('dotenv');
const connectDB = require('../config/db');
const FinanceCategory = require('../models/FinanceCategory');
const financeDefaultCategories = require('../data/financeDefaultCategories');

dotenv.config();

const main = async () => {
  await connectDB();

  let createdCount = 0;
  let updatedCount = 0;

  for (const categoryData of financeDefaultCategories) {
    const existingCategory = await FinanceCategory.findOne({ code: categoryData.code });

    if (existingCategory) {
      existingCategory.name = categoryData.name;
      existingCategory.direction = categoryData.direction;
      existingCategory.group = categoryData.group;
      existingCategory.requiresCounterparty = categoryData.requiresCounterparty;
      existingCategory.requiresSourceDocument = categoryData.requiresSourceDocument;
      existingCategory.requiresInvoiceFlag = categoryData.requiresInvoiceFlag;
      existingCategory.isSystem = categoryData.isSystem;
      existingCategory.isActive = true;
      await existingCategory.save();
      updatedCount += 1;
      continue;
    }

    await FinanceCategory.create(categoryData);
    createdCount += 1;
  }

  console.log(
    JSON.stringify(
      {
        createdCount,
        updatedCount,
        totalSeedItems: financeDefaultCategories.length,
      },
      null,
      2
    )
  );

  process.exit(0);
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = main;
