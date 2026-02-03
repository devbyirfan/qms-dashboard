const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 👇 FIX: Correct static file path
const frontendPath = path.join(__dirname, '../frontend');
console.log('📁 Static files path:', frontendPath);
app.use(express.static(frontendPath));

// Add this for debugging
app.use((req, res, next) => {
  console.log(`📁 Serving: ${req.url}`);
  next();
});

// ==================== ROUTES ====================
const authRoutes = require('./routes/auth');
const checkerRoutes = require('./routes/checkers');

// Test route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'QMS API is running!', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login, /api/auth/register',
      checkers: '/api/checkers (GET, POST, PUT, DELETE)',
      stats: '/api/checkers/stats/performance',
      pdf: '/api/checkers/report/pdf'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'QMS Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/checkers', checkerRoutes);

// ==================== FRONTEND ROUTES ====================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// ==================== ERROR HANDLING ====================
// 404 handler
app.use((req, res) => {
  console.log('⚠️ Route not found:', req.url);
  res.status(404).json({ 
    error: 'Route not found', 
    requestedUrl: req.url 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                                                      ║');
  console.log('║  🚀 QMS DASHBOARD SERVER STARTED                    ║');
  console.log('║                                                      ║');
  console.log(`║  📊 Dashboard: http://localhost:${PORT}              ║`);
  console.log(`║  🔌 API: http://localhost:${PORT}/api               ║`);
  console.log(`║  🗄️  Database: ${process.env.DB_NAME || 'Not connected'} ║`);
  console.log('║                                                      ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');
});