require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const environmentRoutes = require('./src/routes/environment');
const socialRoutes = require('./src/routes/social');
const governanceRoutes = require('./src/routes/governance');
const gamificationRoutes = require('./src/routes/gamification');
const aiRoutes = require('./src/routes/ai');
const reportsRoutes = require('./src/routes/reports');

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/environment', environmentRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌱 EcoSphere AI Backend running on http://localhost:${PORT}`);
});

module.exports = app;
