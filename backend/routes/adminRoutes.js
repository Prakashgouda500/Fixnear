const express = require('express');
const {
  getDashboardStats,
  getUsers,
  getTechnicians,
  getServiceRequests,
  approveTechnician,
  toggleUserStatus,
  deleteUser,
  getComplaints,
  resolveComplaint,
  getPayments,
  getReviews
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/technicians', getTechnicians);
router.get('/service-requests', getServiceRequests);
router.get('/complaints', getComplaints);
router.get('/payments', getPayments);
router.get('/reviews', getReviews);

router.put('/technicians/:id/approve', approveTechnician);
router.put('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.put('/complaints/:id/resolve', resolveComplaint);

module.exports = router;
