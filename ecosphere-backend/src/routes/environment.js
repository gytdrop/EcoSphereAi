const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/environmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, authorize('admin', 'sustainability_manager'));

router.get('/transactions', ctrl.getTransactions);
router.post('/transactions',
  [body('department').notEmpty(), body('emission_factor_id').isInt(), body('quantity').isFloat({ gt: 0 })],
  validate, ctrl.createTransaction
);
router.get('/factors', ctrl.getEmissionFactors);
router.get('/goals', ctrl.getGoals);
router.post('/goals',
  [body('title').notEmpty(), body('target_value').isFloat({ gt: 0 })],
  validate, ctrl.createGoal
);
router.get('/score', ctrl.getScore);
router.get('/department-summary', ctrl.getDepartmentSummary);

module.exports = router;
