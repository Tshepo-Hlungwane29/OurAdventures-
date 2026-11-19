const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    adventure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Adventure',
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    photos: [{
      type: String
    }],

    rating: {
      type: Number,
      min: 1,
      max: 10
    },

    specialMessage: {
      type: String,
      trim: true
    },

    memoryDate: {
      type: Date,
      required: true
    },

    createdBy: {
      type: String,
      enum: ['Tshepo', 'Priscar', 'Both'],
      default: 'Both'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Memory', memorySchema);