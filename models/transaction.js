const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

var transaction = new Schema(
  {
    fromAccountNumber: {
      type: String,
    },
    toAccountNumber: {
      type: String,
    },
    transactionId: {
      type: String,
      required: true,
    },
    amount: {
      type: Currency,
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transaction);
