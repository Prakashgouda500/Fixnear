const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  serviceRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  technicianEarning: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
