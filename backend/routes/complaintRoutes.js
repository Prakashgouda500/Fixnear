const express = require('express');
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { serviceRequestId, title, description } = req.body;
    if (!serviceRequestId || !title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide all details' });
    }
    const complaint = await Complaint.create({
      serviceRequestId,
      reporterId: req.user.id,
      title,
      description
    });
    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
