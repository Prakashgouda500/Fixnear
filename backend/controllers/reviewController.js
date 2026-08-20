const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');
const Technician = require('../models/Technician');

const createReview = async (req, res) => {
  try {
    const { serviceRequestId, rating, comment } = req.body;

    const request = await ServiceRequest.findById(serviceRequestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (request.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this service request' });
    }

    if (request.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot review service that is not completed' });
    }

    const reviewExists = await Review.findOne({ serviceRequestId });
    if (reviewExists) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this service request' });
    }

    const review = await Review.create({
      serviceRequestId,
      customerId: req.user.id,
      technicianId: request.technicianId,
      rating: Number(rating),
      comment
    });

    // Update technician average rating
    const techReviews = await Review.find({ technicianId: request.technicianId });
    const avgRating = techReviews.reduce((sum, r) => sum + r.rating, 0) / techReviews.length;

    await Technician.findOneAndUpdate(
      { userId: request.technicianId },
      { avgRating: parseFloat(avgRating.toFixed(1)) }
    );

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReviewsForRequest = async (req, res) => {
  try {
    const review = await Review.findOne({ serviceRequestId: req.params.serviceRequestId })
      .populate('customerId', 'name');
    res.json({ success: true, review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTechnicianReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ technicianId: req.params.technicianId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReview, getReviewsForRequest, getTechnicianReviews };
