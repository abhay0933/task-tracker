const { Router } = require('express');
const { body } = require('express-validator');
const { signup, login, me } = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth');

const router = Router();

router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', authenticate, me);

module.exports = router;
