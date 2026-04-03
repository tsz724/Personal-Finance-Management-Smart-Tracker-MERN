const mongoose = require('mongoose');

const incomeCategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
    },
  },
  { timestamps: true }
);

incomeCategorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('IncomeCategory', incomeCategorySchema);
