const Event = require('../models/Event');
const mongoose = require('mongoose');

const Organization = require('../models/Organization');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    // Filtering, sorting, pagination
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let query = Event.find(JSON.parse(queryStr)).populate('organization');

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Event.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const events = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: events.length,
      pagination,
      data: events
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organization');

    if (!event) {
      return next(
        new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (Organization)
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Add organization to req.body
  req.body.organization = req.user.id;

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organization)
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return next(
        new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is event owner
    if (event.organization.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this event`,
          401
        )
      );
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organization)
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return next(
        new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is event owner
    if (event.organization.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this event`,
          401
        )
      );
    }

    await event.remove();

    // Remove event from organization's events array
    await Organization.findByIdAndUpdate(
      req.user.id,
      { $pull: { events: event._id } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get organization's events
// @route   GET /api/events/organization/me
// @access  Private (Organization)
// @desc Get organization's events
// @route GET /api/events/organization/me
// @access Private (Organization)
// @desc    Get all events for a specific organization
// @route   GET /api/v1/events/organization/me
// @route   GET /api/v1/events/organization/:orgId
// @access  Private (for /me), Public (for /:orgId)
exports.getOrganizationEvents = asyncHandler(async (req, res, next) => {
  let orgId;
  
  // If using /me route, get orgId from logged-in user
  if (req.route.path === '/organization/me') {
    if (!req.user || !req.user.id) {
      return next(new ErrorResponse('Organization ID not found in request', 400));
    }
    orgId = req.user.id;
  } else {
    // For /:orgId route
    orgId = req.params.orgId;
    if (!orgId) {
      return next(new ErrorResponse('Organization ID not provided', 400));
    }
  }

  // Validate the organization ID format
  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return next(new ErrorResponse('Invalid organization ID format', 400));
  }

  const events = await Event.find({ organization: orgId })
    .populate('organization', 'organizationName logo')
    .sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});


// @desc    Register volunteer for event
// @route   POST /api/events/:eventId/register
// @access  Private (Volunteer)
exports.registerForEvent = asyncHandler(async (req, res, next) => {

  
  if (!req.body.volunteerId || !req.body.message || !req.body.skills) {
    return next(new ErrorResponse('Missing required fields', 400));
  }

  const event = await Event.findById(req.params.eventId);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.eventId}`, 404));
  }

  // Verify the volunteer ID matches the logged-in user
  if (req.body.volunteerId !== req.user.id) {
    return next(new ErrorResponse('Not authorized to register for this event', 401));
  }

  // Check if volunteer is already registered
  const alreadyRegistered = event.volunteersRegistered.some(
    v => v.volunteer.toString() === req.user.id
  );

  if (alreadyRegistered) {
    return next(new ErrorResponse('You are already registered for this event', 400));
  }

  // Check if event is full
  if (event.volunteersRegistered.length >= event.volunteersNeeded) {
    return next(new ErrorResponse('This event is already full', 400));
  }

  // Add volunteer to event
  event.volunteersRegistered.push({
    volunteer: req.user.id,
    status: 'pending',
    message: req.body.message,
    skills: req.body.skills
  });

  await event.save();

  // Add event to volunteer's registered events
  await Volunteer.findByIdAndUpdate(
    req.user.id,
    { $push: { registeredEvents: event._id } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Update volunteer status for event
// @route   PUT /api/events/:eventId/volunteers/:volunteerId
// @access  Private (Organization)
exports.updateVolunteerStatus = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);
  
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.eventId}`, 404));
  }

  // Check if user is event owner
  if (event.organization.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this event`, 401));
  }

  // Find the volunteer in the event
  const volunteerIndex = event.volunteersRegistered.findIndex(
    v => v.volunteer.toString() === req.params.volunteerId
  );

  if (volunteerIndex === -1) {
    return next(new ErrorResponse(`Volunteer not found in this event`, 404));
  }

  // Update status
  event.volunteersRegistered[volunteerIndex].status = req.body.status;
  await event.save();

  res.status(200).json({
    success: true,
    data: event
  });
});
