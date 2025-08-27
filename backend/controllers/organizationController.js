const Organization = require('../models/Organization');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Private/Admin
exports.getOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.find().populate('user');

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Private
exports.getOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id).populate(
      'user events'
    );

    if (!organization) {
      return next(
        new ErrorResponse(
          `Organization not found with id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get organization's events
// @route   GET /api/organizations/me/events
// @access  Private
exports.getMyEvents = async (req, res, next) => {
  try {
    const organization = await Organization.findOne({
      user: req.user.id,
    }).populate('events');

    if (!organization) {
      return next(new ErrorResponse('Organization not found', 404));
    }

    res.status(200).json({
      success: true,
      data: organization.events,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create event
// @route   POST /api/organizations/events
// @access  Private
exports.createEvent = async (req, res, next) => {
  try {
    // Add organization to req.body
    req.body.organization = req.user.id;

    const event = await Event.create(req.body);

    // Add event to organization's events array
    const organization = await Organization.findOneAndUpdate(
      { user: req.user.id },
      { $push: { events: event._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};