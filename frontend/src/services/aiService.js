import api from './api';

export const aiService = {
  // Send message to AI Hotel Assistant
  sendMessage: async (message, history = []) => {
    const response = await api.post('/chat/message', { message, history });
    return response.data;
  },
};

export default aiService;
