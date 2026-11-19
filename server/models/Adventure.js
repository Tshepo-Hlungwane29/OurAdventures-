const mongoose = require('mongoose');

const adventureSchema = new mongoose.Schema(
  {
    activity: {
      type: String,
      required: true,
      trim: true
    },

    icon: {
      type: String,
      default: '❤️'
    },

    adventureDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ['planned', 'completed', 'cancelled'],
      default: 'planned'
    },

    chosenBy: {
      type: String,
      enum: ['Tshepo', 'Priscar', 'Both'],
      default: 'Both'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Adventure', adventureSchema);