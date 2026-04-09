const mongoose = require('mongoose');
require('dotenv').config();
const AdminQuote = require('./models/AdminQuote');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    const items = [
      {
        productName: "Test SP",
        quantity: 100,
        specs: "Specs",
        unitPrice: 50,
        totalPrice: 5000,
        costBreakdown: {
          paperCost: 10,
          printCost: 10,
          lamCost: 10,
          dieCost: 10,
          uvCost: 5,
          foilCost: 5,
          totalCost: 50,
          margin: 0
        }
      }
    ];

    const quote = new AdminQuote({
      customerName: "Test Customer",
      items,
      grandTotal: 5000,
      notes: ""
    });

    const result = await quote.save();
    console.log("Saved Quote:", JSON.stringify(result, null, 2));

    process.exit(0);
  })
  .catch(err => {
    console.error("Save Error:", err);
    process.exit(1);
  });
