const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const Organization = require('../models/Organization');
const ErrorResponse = require('../utils/errorResponse');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');
const config = require('../config/config');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { email, password, role, name } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email is already registered', 400));
    }

    // Create user with isVerified false
    const user = await User.create({
      email,
      password,
      role,
      isVerified: true,
      verificationToken: crypto.randomBytes(20).toString('hex'),
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email, 
        user.verificationToken,
        name || 'User'
      );

      res.status(201).json({
        success: true,
        data: {
          email: user.email,
          role: user.role,
          message: 'Verification email sent. Please check your inbox.'
        }
      });
    } catch (emailError) {
      // Remove the user if email fails
      await User.findByIdAndDelete(user._id);
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    // Redirect to frontend or send success response
    res.status(200).json({
      success: true,
      data: {
        message: 'Email verified successfully! You can now complete your profile.',
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('No user found with this email', 404));
    }

    if (user.isVerified) {
      return next(new ErrorResponse('Email is already verified', 400));
    }

    // Generate new token
    user.verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        user.verificationToken,
        user.name || 'User'
      );

      res.status(200).json({
        success: true,
        data: {
          message: 'Verification email resent successfully!'
        }
      });
    } catch (emailError) {
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Complete profile after verification
// @route   POST /api/auth/complete-profile
// @access  Private
exports.completeProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.isVerified) {
      return next(new ErrorResponse('Please verify your email first', 401));
    }

    let profile;

    if (user.role === 'volunteer') {
      const {
        name,
        phone,
        interests,
        skills,
       
        previousExperience,
        profileImage
      } = req.body;

      profile = await Volunteer.create({
        user: user._id,
        name,
        phone,
        interests,
        skills,
        
        previousExperience
      });

      if (profileImage) {
        user.profileImage = profileImage;
        await user.save();
      }
    } else if (user.role === 'organization') {
      const {
        organizationName,
        
        phone,
        address,
        website,
        description,
        
        logo
      } = req.body;

      profile = await Organization.create({
        user: user._id,
        organizationName,
      
        phone,
        address,
        website,
        description,
       
        logo
      });

      if (logo) {
        user.profileImage = logo;
        await user.save();
      }
    }

    // Generate new token with complete profile
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      role: user.role,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// ... rest of your authController methods ...
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if email is verified
  if (!user.isVerified) {
    return next(new ErrorResponse('Please verify your email first', 401));
  }

  // Get profile based on role
  let profile;
  if (user.role === 'volunteer') {
    profile = await Volunteer.findOne({ user: user._id });
  } else if (user.role === 'organization') {
    profile = await Organization.findOne({ user: user._id });
  }

  // Create token
  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    token,
    role: user.role,
    profile,
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  let profile;
  if (req.user.role === 'volunteer') {
    profile = await Volunteer.findOne({ user: req.user.id });
  } else if (req.user.role === 'organization') {
    profile = await Organization.findOne({ user: req.user.id }).populate(
      'events'
    );
  }

      res.status(200).json({
        success: true,
    data: profile,
      });
};