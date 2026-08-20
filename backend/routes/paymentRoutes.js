const express = require('express');
const { processPayment, getPaymentByRequest } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/checkout', protect, processPayment);
router.get('/:serviceRequestId', protect, getPaymentByRequest);

module.exports = router;
