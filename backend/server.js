const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const cors = require('cors');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const volunteers = require('./routes/volunteerRoutes');
const organizations = require('./routes/organizationRoutes');
const events = require('./routes/eventRoutes');

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS - Important for Expo development
app.use(cors({
  origin: [
    'http://localhost:19006', // Expo web
    'exp://192.168.80.237:19000', // Your local IP with Expo
    /\.yourdomain\.com$/ // If you have a domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Allow pre-flight requests for all routes
app.options('*', cors());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/volunteers', volunteers);
app.use('/api/organizations', organizations);
app.use('/api/events', events);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  '0.0.0.0', // Listen on all network interfaces
  () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
    );
    console.log(`Accessible on:
  - Local: http://localhost:${PORT}
  - Network: http://192.168.80.237:${PORT}`.cyan);
  }
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});