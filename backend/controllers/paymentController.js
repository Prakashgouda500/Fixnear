const Payment = require('../models/Payment');
const ServiceRequest = require('../models/ServiceRequest');
const Technician = require('../models/Technician');
const Notification = require('../models/Notification');

const processPayment = async (req, res) => {
  try {
    const { serviceRequestId, paymentMethod } = req.body;

    const request = await ServiceRequest.findById(serviceRequestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (request.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to make payment for this request' });
    }

    const existingPayment = await Payment.findOne({ serviceRequestId, status: 'COMPLETED' });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'Payment already completed for this request' });
    }

    const amount = request.price || 800;
    const platformFee = Math.round(amount * 0.10);
    const technicianEarning = amount - platformFee;

    const payment = await Payment.create({
      serviceRequestId,
      customerId: req.user.id,
      technicianId: request.technicianId,
      amount,
      platformFee,
      technicianEarning,
      status: 'COMPLETED',
      paymentMethod: paymentMethod || 'mock_card',
      transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    });

    if (request.technicianId) {
      await Technician.findOneAndUpdate(
        { userId: request.technicianId },
        { $inc: { totalEarnings: technicianEarning } }
      );

      await Notification.create({
        userId: request.technicianId,
        title: 'Payment Received',
        message: `You earned ₹${technicianEarning} for service request "${request.title}".`,
        type: 'payment'
      });
    }

    res.status(201).json({ success: true, payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentByRequest = async (req, res) => {
  try {
    const payment = await Payment.findOne({ serviceRequestId: req.params.serviceRequestId });
    res.json({ success: true, payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { processPayment, getPaymentByRequest };
