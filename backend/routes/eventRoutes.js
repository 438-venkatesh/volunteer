const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizationEvents,
  registerForEvent,
  updateVolunteerStatus
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, authorize('organization'), createEvent);

router.route('/:id')
  .get(getEvent)
  .put(protect, authorize('organization'), updateEvent)
  .delete(protect, authorize('organization'), deleteEvent);

// This route is already in your code
router.route('/organization/me')
  .get(protect, authorize('organization'), getOrganizationEvents);

// Add these routes to eventRoutes.js
router.route('/:eventId/register')
  .post(protect, authorize('volunteer'), registerForEvent);

router.route('/:eventId/volunteers/:volunteerId')
  .put(protect, authorize('organization'), updateVolunteerStatus);


module.exports = router;