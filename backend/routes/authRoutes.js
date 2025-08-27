const express = require('express');
const {
  register,
  login,
  getMe,
 
  verifyEmail,
  resendVerification,
  completeProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, getMe);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/complete-profile', protect, completeProfile);

module.exports = router;