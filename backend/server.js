const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { autoSeedIfEmpty } = require('./config/seed');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database & Auto Seed if empty
connectDB().then(() => {
  autoSeedIfEmpty();
});

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'TAKKUNU BOOKU Hotel Room Booking System API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Static directory for uploaded photos
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Core Module Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Mount Upload Route (Hotel & Room Photos)
app.use('/api/upload', require('./routes/uploadRoutes'));

// Mount Enhanced Feature Routes (AI, Reviews, Coupons, Notifications)
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 404 & Central Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  TAKKUNU BOOKU Backend API (Find. Book. Stay.)`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`  API Health: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
