const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['url', 'text'],
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  scanned: {
    type: Boolean,
    default: false
  },
  scanDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QRCode', qrCodeSchema); 