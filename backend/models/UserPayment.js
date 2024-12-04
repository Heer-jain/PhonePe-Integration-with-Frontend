const mongoose = require("mongoose");

const UserPaymentSchema = new mongoose.Schema({
  userId: { type: Number },
  mobileNumber: { type: String},
  status: { type: String, default: "inactive" }, // 'inactive' or 'active'
  nextPaymentDate: { type: Date },
  lastPaymentDate: { type: Date },
  transactionId: { type: String },
});

module.exports = mongoose.model("UserPayment", UserPaymentSchema);
