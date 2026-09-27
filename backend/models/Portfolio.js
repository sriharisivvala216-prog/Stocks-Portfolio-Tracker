const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    companySymbol: {
      type: String,
      required: [true, "Stock symbol is required"],
      uppercase: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    transactionType: {
      type: String,
      required: [true, "Transaction type is required"],
      uppercase: true,
      enum: ["BUY", "SELL"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.0001, "Quantity must be positive"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0.01, "Price must be positive"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compiling model if already defined
module.exports = mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema);
