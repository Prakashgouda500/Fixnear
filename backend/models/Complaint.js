const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  serviceRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'RESOLVED'], default: 'PENDING' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
