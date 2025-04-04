const router = require('express').Router();
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const QRCodeModel = require('../models/QRCode');

// Generate QR Code
router.post('/generate', auth, async (req, res) => {
  try {
    const { content, type } = req.body;
    
    // Generate QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(content);
    
    // Save to database
    const qrCode = new QRCodeModel({
      user: req.user.id,
      content,
      type,
      imageUrl: qrCodeDataUrl
    });
    
    await qrCode.save();
    
    res.json({
      qrCode: {
        id: qrCode._id,
        content: qrCode.content,
        type: qrCode.type,
        imageUrl: qrCode.imageUrl,
        createdAt: qrCode.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating QR code', error: error.message });
  }
});

// Get user's QR codes with pagination and date filter
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const query = { user: req.user.id };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const qrCodes = await QRCodeModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await QRCodeModel.countDocuments(query);
    
    res.json({
      qrCodes,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching QR codes', error: error.message });
  }
});

// Share QR Code via email
router.post('/share/:id', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const qrCode = await QRCodeModel.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Shared QR Code',
      html: `
        <h1>QR Code Content</h1>
        <p>${qrCode.content}</p>
        <img src="${qrCode.imageUrl}" alt="QR Code" />
      `
    });
    
    res.json({ message: 'QR code shared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing QR code', error: error.message });
  }
});

// Mark QR code as scanned
router.post('/scan/:id', auth, async (req, res) => {
  try {
    const qrCode = await QRCodeModel.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }
    
    qrCode.scanned = true;
    qrCode.scanDate = new Date();
    await qrCode.save();
    
    res.json({ message: 'QR code marked as scanned' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking QR code as scanned', error: error.message });
  }
});

module.exports = router; 