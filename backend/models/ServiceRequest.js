const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    lat: { type: Number },
    long: { type: Number }
  },
  preferredDateTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'TECHNICIAN_ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  price: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
