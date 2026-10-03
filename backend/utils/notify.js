const Notification = require('../models/Notification');

const createNotification = async ({ userId, title, message, type = 'booking', link = '/my-bookings' }) => {
  try {
    if (!userId) return null;
    return await Notification.create({
      userId,
      title,
      message,
      type,
      link,
    });
  } catch (error) {
    console.error('Failed to create in-app notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };
