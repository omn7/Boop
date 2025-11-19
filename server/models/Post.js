const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true
  },
  breed: {
    type: String,
    required: true
  },
  humanName: {
    type: String,
    required: true
  },
  bio: {
    type: String
  },
  imageUrl: {
    type: String,
    required: true
  },
  boopCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);
