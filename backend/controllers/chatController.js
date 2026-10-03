const { askAIAssistant, search_hotels } = require('../services/aiService');

// @desc    Process AI Chat message
// @route   POST /api/chat/message
// @access  Public
const handleChatMessage = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    const aiResponse = await askAIAssistant(message, history || []);

    res.json({
      success: true,
      ...aiResponse,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleChatMessage,
};
