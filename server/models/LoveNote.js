const mongoose = require('mongoose');

const loveNoteSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    from: {
      type: String,
      enum: ['Tshepo', 'Priscar'],
      required: true
    },

    to: {
      type: String,
      enum: ['Tshepo', 'Priscar', 'Both'],
      default: 'Both'
    },

    isSurprise: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LoveNote', loveNoteSchema);