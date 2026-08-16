const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  processChatMessage,
  getAIAssistantStatus,
} = require('../controllers/aiAssistantController');

// All AI Assistant routes are protected for internal staff/admins
router.use(protect, admin);

// Status check
router.get('/status', getAIAssistantStatus);

// Chat & Action endpoint
router.post('/chat', processChatMessage);

module.exports = router;
