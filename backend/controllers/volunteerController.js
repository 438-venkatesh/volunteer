const Volunteer = require('../models/Volunteer');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Private/Admin
exports.getVolunteers = async (req, res, next) => {
  try {
    const volunteers = await Volunteer.find().populate('user');

    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single volunteer
// @route   GET /api/volunteers/:id
// @access  Private
exports.getVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id).populate('user');

    if (!volunteer) {
      return next(
        new ErrorResponse(`Volunteer not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get volunteer's registered events
// @route   GET /api/volunteers/me/events
// @access  Private
exports.getMyEvents = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user.id }).populate({
      path: 'registeredEvents.event',
      select: 'title description date location category',
    });

    if (!volunteer) {
      return next(new ErrorResponse('Volunteer not found', 404));
    }

    res.status(200).json({
      success: true,
      data: volunteer.registeredEvents,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register for an event
// @route   POST /api/volunteers/register/:eventId
// @access  Private
exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return next(
        new ErrorResponse(`Event not found with id of ${req.params.eventId}`, 404)
      );
    }

    // Check if already registered
    const volunteer = await Volunteer.findOne({ user: req.user.id });
    const alreadyRegistered = volunteer.registeredEvents.some(
      (reg) => reg.event.toString() === req.params.eventId
    );

    if (alreadyRegistered) {
      return next(new ErrorResponse('Already registered for this event', 400));
    }

    // Add to volunteer's registered events
    volunteer.registeredEvents.push({
      event: req.params.eventId,
      status: 'pending',
    });
    await volunteer.save();

    // Add to event's volunteers registered
    event.volunteersRegistered.push({
      volunteer: volunteer._id,
      status: 'pending',
    });
    await event.save();

    res.status(200).json({
      success: true,
      data: volunteer.registeredEvents,
    });
  } catch (err) {
    next(err);
  }
};