require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const seedIfEmpty = require('./infrastructure/database/seedIfEmpty');

const app = express();

// CORS — supports exact origin, comma-separated list, or wildcard patterns
const allowedOrigins = config.clientUrl
  ? config.clientUrl.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks, same-origin)
    if (!origin) return callback(null, true);
    // Allow any *.vercel.app subdomain for preview deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', demoMode: config.demoMode, env: config.nodeEnv });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Database + Server startup
async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[DB] MongoDB connected');
    await seedIfEmpty();

    app.listen(config.port, () => {
      console.log(`[Server] Running on port ${config.port} (${config.nodeEnv})`);
      console.log(`[Server] Demo mode: ${config.demoMode}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
