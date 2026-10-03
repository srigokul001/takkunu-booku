const express = require('express');
const router = express.Router();
const { handleChatMessage } = require('../controllers/chatController');

router.post('/message', handleChatMessage);

module.exports = router;
