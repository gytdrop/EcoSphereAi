const express = require('express');
const { body } = require('express-validator');
const { advisor, simulate } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(authenticate);

router.post('/advisor', advisor);
router.post('/simulate',
  [
    body('treesPlanted').optional().isInt({ min: 0 }),
    body('carbonReductionPercent').optional().isFloat({ min: 0, max: 100 }),
    body('complianceIssuesResolved').optional().isInt({ min: 0 }),
  ],
  validate,
  simulate
);

module.exports = router;
