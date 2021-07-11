const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

var account = new Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    accountBalance: {
      type: Currency,
      required: true,
      min: 0,
      default: 0,
    },
    accountOwner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    activeStatus: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["checking", "savings"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Account", account);
