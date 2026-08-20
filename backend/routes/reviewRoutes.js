const express = require('express');
const { createReview, getReviewsForRequest, getTechnicianReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, authorize('customer'), createReview);

router.route('/:serviceRequestId')
  .get(protect, getReviewsForRequest);

router.route('/technician/:technicianId')
  .get(getTechnicianReviews);

module.exports = router;
