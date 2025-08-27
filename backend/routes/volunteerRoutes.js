const express = require('express');
const {
  getVolunteers,
  getVolunteer,
  getMyEvents,
  registerForEvent,
} = require('../controllers/volunteerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getVolunteers);
router.get('/:id', getVolunteer);
router.get('/me/events', authorize('volunteer'), getMyEvents);
router.post('/register/:eventId', authorize('volunteer'), registerForEvent);

module.exports = router;