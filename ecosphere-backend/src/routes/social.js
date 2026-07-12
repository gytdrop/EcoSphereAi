const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/socialController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
router.use(authenticate, authorize('admin', 'hr_manager', 'employee'));

router.get('/csr', ctrl.getCSRActivities);
router.post('/csr', [body('title').notEmpty()], validate, ctrl.createCSRActivity);
router.post('/csr/:id/join', ctrl.joinCSRActivity);
router.patch('/csr/:id/approve', authorize('admin', 'sustainability_manager'), ctrl.approveCSRActivity);
router.get('/training', ctrl.getTrainingPrograms);
router.get('/diversity', ctrl.getDiversityMetrics);

module.exports = router;
