// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working correctly!',
    environment: process.env.NODE_ENV
  });
});

// Import routes
import authRoutes from './routes/authRoutes.js';
import programRoutes from './routes/programRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import academicTermRoutes from './routes/academicTermRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import incResolutionRoutes from './routes/incResolutionRoutes.js';
import repeatEligibilityRoutes from './routes/repeatEligibilityRoutes.js';
import professorRoutes from './routes/professorRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/academic-terms', academicTermRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/inc-resolutions', incResolutionRoutes);
app.use('/api/repeat-eligibility', repeatEligibilityRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/admissions', admissionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error', 
    message: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

export default app;