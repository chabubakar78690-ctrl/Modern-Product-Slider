import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import paymentRoutes from './server/routes/payments.js';
import { db } from './api/v1/_db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration for frontend
const allowedOrigins = [
  'https://modern-product-slider.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.some((o) => origin.startsWith(o))) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all during dev/demo
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token', 'X-SFPY-SIGNATURE', 'X-SFPY-TIMESTAMP', 'X-SFPY-EVENT-ID'],
  })
);

// Capture raw body for webhook HMAC signature verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Modern Product Slider SaaS Backend',
    paymentGateway: 'Safepay',
    environment: process.env.SAFEPAY_ENVIRONMENT || 'sandbox',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Modern Product Slider SaaS Backend',
    paymentGateway: 'Safepay',
    environment: process.env.SAFEPAY_ENVIRONMENT || 'sandbox',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount Payment Gateway Routes
app.use('/api/v1/payments', paymentRoutes);

// Mount Existing Auth & Admin APIs for Standalone Server Compatibility
import adminLoginHandler from './api/v1/auth/admin-login.js';
import sendCodeHandler from './api/v1/auth/send-code.js';
import verifyCodeHandler from './api/v1/auth/verify-code.js';
import googleAuthHandler from './api/v1/auth/google.js';
import adminOverviewHandler from './api/v1/admin/overview.js';
import adminCredentialsHandler from './api/v1/admin/credentials.js';
import licenseVerifyHandler from './api/v1/license/verify.js';
import licenseDeactivateHandler from './api/v1/license/deactivate.js';

app.all('/api/v1/auth/admin-login', (req, res) => adminLoginHandler(req, res));
app.all('/api/v1/auth/send-code', (req, res) => sendCodeHandler(req, res));
app.all('/api/v1/auth/verify-code', (req, res) => verifyCodeHandler(req, res));
app.all('/api/v1/auth/google', (req, res) => googleAuthHandler(req, res));
app.all('/api/v1/admin/overview', (req, res) => adminOverviewHandler(req, res));
app.all('/api/v1/admin/credentials', (req, res) => adminCredentialsHandler(req, res));
app.all('/api/v1/license/verify', (req, res) => licenseVerifyHandler(req, res));
app.all('/api/v1/license/deactivate', (req, res) => licenseDeactivateHandler(req, res));

// 404 handler for undefined API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Modern Product Slider SaaS Backend Online`);
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`💳 Safepay Gateway Mode: ${process.env.SAFEPAY_ENVIRONMENT || 'sandbox'}`);
  console.log(`🔒 Webhook Endpoint: http://localhost:${PORT}/api/v1/payments/webhook`);
  console.log(`=======================================================`);
});

export default app;
