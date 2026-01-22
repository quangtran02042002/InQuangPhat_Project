const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    taxCode: { type: String, required: false },
    generalEmail: { type: String, required: false },
    
    // --- PHÂN LOẠI KHÁCH HÀNG ---
    group: { 
        type: String, 
        required: true, 
        enum: ['offset', 'garment', 'mixed'], // offset: In giấy, garment: In vải, mixed: Cả hai
        default: 'offset' 
    },
    productsInterested: { type: String, required: false }, // VD: Hộp cứng, Tem nhãn...
    // ----------------------------

    contacts: [
      {
        name: { type: String, required: true },
        position: { type: String, required: false },
        phone: { type: String, required: true },
        email: { type: String, required: false },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);