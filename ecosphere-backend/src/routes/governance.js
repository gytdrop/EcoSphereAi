const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/governanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(authenticate, authorize('admin', 'compliance_officer'));

router.get('/policies', ctrl.getPolicies);
router.post('/policies',
  [body('title').notEmpty(), body('content').notEmpty()],
  validate, ctrl.createPolicy
);
router.post('/policies/:id/acknowledge', ctrl.acknowledgePolicy);
router.get('/compliance', ctrl.getComplianceIssues);
router.post('/compliance',
  [body('title').notEmpty(), body('due_date').isDate()],
  validate, ctrl.createComplianceIssue
);
router.patch('/compliance/:id',
  [body('status').isIn(['open','in_progress','resolved','overdue'])],
  validate, ctrl.updateComplianceIssue
);
router.get('/audits', ctrl.getAudits);

module.exports = router;
