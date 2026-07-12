const express = require('express');
const { getESGReport } = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.get('/esg', authenticate, getESGReport);

module.exports = router;
