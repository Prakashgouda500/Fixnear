const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  experience: { type: Number, required: true },
  serviceArea: [{ type: String, required: true }],
  availability: { type: Boolean, default: true },
  isApproved: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  avgRating: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Technician', technicianSchema);
