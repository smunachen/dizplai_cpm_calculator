const express = require('express');
const cors = require('cors');
require('dotenv').config();

const benchmarksRoutes = require('./routes/benchmarks');
const calculatorRoutes = require('./routes/calculator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/benchmarks', benchmarksRoutes);
app.use('/api/calculator', calculatorRoutes);

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
