const express = require('express');
const router = express.Router();
const { submitContact, getContacts } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { permit } = require('../middleware/roleMiddleware');

router.post('/', submitContact);
router.get('/', protect, permit('admin'), getContacts);

module.exports = router;
