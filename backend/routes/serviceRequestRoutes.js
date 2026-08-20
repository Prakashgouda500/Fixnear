const express = require('express');
const {
  createServiceRequest,
  getCustomerRequests,
  getServiceRequestById,
  updateServiceRequest,
  cancelServiceRequest,
  getNearbyRequests,
  getTechnicianJobs,
  acceptRequest,
  rejectRequest,
  updateStatus
} = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
  .post(protect, authorize('customer'), upload.array('images', 5), createServiceRequest)
  .get(protect, authorize('customer'), getCustomerRequests);

router.get('/nearby', protect, authorize('technician'), getNearbyRequests);
router.get('/jobs', protect, authorize('technician'), getTechnicianJobs);

router.route('/:id')
  .get(protect, getServiceRequestById)
  .put(protect, authorize('customer'), updateServiceRequest)
  .delete(protect, cancelServiceRequest);

router.put('/:id/status', protect, authorize('technician', 'admin'), updateStatus);
router.post('/:id/accept', protect, authorize('technician'), acceptRequest);
router.post('/:id/reject', protect, authorize('technician'), rejectRequest);

module.exports = router;
