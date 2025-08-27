const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Send verification email
// @route   POST /api/auth/sendverification
// @access  Private
exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.isVerified) {
      return next(new ErrorResponse('User already verified', 400));
    }

    // Get verification token
    const verificationToken = user.getVerificationToken();
    await user.save();

    // Create verification URL
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${verificationToken}`;

    const message = `
      <h1>Email Verification</h1>
      <p>Please click the following link to verify your email:</p>
      <a href=${verificationUrl} clicktracking=off>${verificationUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Email Verification',
        text: message,
      });

      res.status(200).json({
        success: true,
        data: 'Verification email sent',
      });
    } catch (err) {
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save();

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verifyemail/:verificationToken
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    // Hash token
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.verificationToken)
      .digest('hex');

    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Set isVerified to true and clear verification fields
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Email verified successfully',
    });
  } catch (err) {
    next(err);
  }
};