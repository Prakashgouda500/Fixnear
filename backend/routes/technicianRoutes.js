const express = require('express');
const { getTechnicians, getTechnicianById, updateTechnician } = require('../controllers/technicianController');
const { acceptRequest, rejectRequest } = require('../controllers/serviceRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(getTechnicians);

router.route('/:id')
  .get(getTechnicianById)
  .put(protect, updateTechnician);

router.post('/:id/accept', protect, authorize('technician'), acceptRequest);
router.post('/:id/reject', protect, authorize('technician'), rejectRequest);

module.exports = router;
