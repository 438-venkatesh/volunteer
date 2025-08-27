const express = require('express');
const {
  getOrganizations,
  getOrganization,
  getMyEvents,
  createEvent,
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getOrganizations);
router.get('/:id', getOrganization);
router.get('/me/events', authorize('organization'), getMyEvents);
router.post('/events', authorize('organization'), createEvent);

module.exports = router;