const mongoose = require('mongoose');
require('dotenv').config();
const AdminQuote = require('./models/AdminQuote');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // 1. Check current count
    const count = await AdminQuote.countDocuments();
    console.log("Current count:", count); // Supposed to be 2
    
    // 2. Delete the oldest quote
    const oldest = await AdminQuote.findOne().sort({createdAt: 1});
    if (oldest) {
      await AdminQuote.deleteOne({_id: oldest._id});
      console.log("Deleted oldest quote:", oldest.quoteCode);
    }
    
    // 3. Try to save a new quote
    const quote = new AdminQuote({
      customerName: "Duplicate Test",
      items: [{
        productName: "Test", quantity: 1, specs: "", unitPrice: 0, totalPrice: 0
      }],
      grandTotal: 0
    });
    
    try {
      await quote.save();
      console.log("Saved new successfully");
    } catch(e) {
      console.error("EXPECTED ERROR:", e.message);
    }

    process.exit(0);
  })
