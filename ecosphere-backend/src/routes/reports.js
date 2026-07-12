const express = require('express');
const { getESGReport } = require('../controllers/reportsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.get('/esg', authenticate, authorize('admin', 'sustainability_manager', 'hr_manager', 'compliance_officer'), getESGReport);

module.exports = router;
