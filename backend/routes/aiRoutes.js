const express = require('express');
const { getDiagnosis } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/diagnose', protect, getDiagnosis);

module.exports = router;
