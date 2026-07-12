const express = require('express');
const { body } = require('express-validator');
const { login, register, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);

router.post('/register',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin','sustainability_manager','hr_manager','compliance_officer','employee','executive']),
    body('department').optional().trim(),
  ],
  validate,
  register
);

router.get('/me', authenticate, getMe);

module.exports = router;
