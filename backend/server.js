const express = require('express');
const cors = require('cors');
require('dotenv').config();

const benchmarksRoutes = require('./routes/benchmarks');
const calculatorRoutes = require('./routes/calculator');
const campaignsRoutes = require('./routes/campaigns');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/benchmarks', benchmarksRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Dizplai CPM Calculator API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Dizplai CPM Calculator API running on port ${PORT}`);
});