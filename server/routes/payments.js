import express from 'express';
import {
  PLAN_CATALOG,
  createOrder,
  findOrderById,
  findOrderByTracker,
  markOrderPaid,
  markOrderFailed,
  markOrderCancelled,
  db,
} from '../../api/v1/_db.js';
import {
  safepayConfig,
  createPaymentTracker,
  buildHostedCheckoutUrl,
  verifyTrackerStatus,
  verifyWebhookSignature,
} from '../safepay.js';

const router = express.Router();

// Set of processed webhook event IDs to guarantee strict idempotency
const processedWebhookEvents = new Set();

/**
 * GET /api/v1/payments/config
 * Exposes non-sensitive payment gateway configuration for the frontend
 */
router.get('/config', (req, res) => {
  return res.json({
    gateway: 'safepay',
    environment: safepayConfig.environment,
    isConfigured: Boolean(safepayConfig.apiKey),
    supportedCurrencies: ['PKR', 'USD'],
    plans: PLAN_CATALOG,
  });
});

/**
 * POST /api/v1/payments/create-session
 * Creates a validated payment session with Safepay.
 * CRITICAL SECURITY: Never trust prices or totals submitted by the client!
 */
router.post('/create-session', async (req, res) => {
  try {
    const { email, name, planId, currency = 'PKR', redirectOrigin } = req.body || {};

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid customer email is required.' });
    }

    if (!planId || !PLAN_CATALOG[planId]) {
      return res.status(400).json({ error: `Invalid plan selected: "${planId}". Must be "single" or "unlimited".` });
    }

    // Authoritative Server-Side Price & Currency Calculation
    const plan = PLAN_CATALOG[planId];
    const cleanCurrency = String(currency).toUpperCase() === 'USD' ? 'USD' : 'PKR';
    const amount = cleanCurrency === 'USD' ? plan.priceUsd : plan.pricePkr;
    const amountLowestDenom = amount * 100; // in paisas or cents

    // 1. Create Internal Order in Database with PENDING status
    const order = createOrder({
      customerEmail: cleanEmail,
      customerName: name || cleanEmail.split('@')[0],
      planId: plan.id,
      currency: cleanCurrency,
      metadata: {
        clientOrigin: redirectOrigin || req.headers.origin || '',
        ip: req.ip || req.headers['x-forwarded-for'],
      },
    });

    // 2. Request Official Safepay Payment Tracker
    const trackerResult = await createPaymentTracker({
      amountLowestDenom,
      currency: cleanCurrency,
      orderId: order.id,
      customerEmail: cleanEmail,
    });

    if (!trackerResult.success || !trackerResult.trackerToken) {
      markOrderFailed(order.id, 'Failed to create Safepay payment tracker');
      return res.status(502).json({ error: 'Could not initialize Safepay payment session. Please try again.' });
    }

    // Attach tracker to order record
    order.trackerToken = trackerResult.trackerToken;
    db.persist();

    // 3. Build Frontend Redirect URLs
    const origin = redirectOrigin || req.headers.origin || process.env.FRONTEND_URL || 'https://modern-product-slider.vercel.app';
    const redirectUrl = `${origin}/#payment-success?order_id=${encodeURIComponent(order.id)}&beacon=${encodeURIComponent(trackerResult.trackerToken)}`;
    const cancelUrl = `${origin}/#payment-cancel?order_id=${encodeURIComponent(order.id)}`;

    // 4. Construct Official Hosted Checkout URL
    const checkoutUrl = buildHostedCheckoutUrl({
      trackerToken: trackerResult.trackerToken,
      orderId: order.id,
      redirectUrl,
      cancelUrl,
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      trackerToken: trackerResult.trackerToken,
      checkoutUrl,
      amount,
      currency: cleanCurrency,
      planName: plan.name,
      environment: safepayConfig.environment,
      sandboxNotice: trackerResult.sandboxNotice || null,
    });
  } catch (err) {
    console.error('[Create Payment Session Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal payment processing error' });
  }
});

/**
 * POST /api/v1/payments/verify
 * Server-to-server payment verification.
 * CRITICAL SECURITY: Never trust client redirect query params. Only verify server-side!
 */
router.post('/verify', async (req, res) => {
  try {
    const { orderId, trackerToken } = req.body || {};

    if (!orderId && !trackerToken) {
      return res.status(400).json({ error: 'Missing orderId or trackerToken.' });
    }

    // Locate order in database
    const order = findOrderById(orderId) || findOrderByTracker(trackerToken);
    if (!order) {
      return res.status(404).json({ error: 'Order not found in database.' });
    }

    // If order was already verified as PAID, return success (Idempotent)
    if (order.status === 'PAID') {
      const existingUser = db.users.get(order.customerEmail);
      return res.status(200).json({
        success: true,
        verified: true,
        order,
        user: existingUser,
        licenseKey: order.licenseKeyGenerated,
        message: 'Order already verified and paid.',
      });
    }

    // Verify payment tracker state directly with Safepay server-to-server
    const verifyResult = await verifyTrackerStatus({
      trackerToken: trackerToken || order.trackerToken,
      orderId: order.id,
      expectedAmount: order.amountLowestDenom,
    });

    if (verifyResult.verified) {
      // Mark order as PAID, generate license key, and record transaction
      const { user, licenseKey } = markOrderPaid(
        order.id,
        verifyResult.gatewayTxnId,
        verifyResult.paymentMethod || 'Safepay'
      );

      return res.status(200).json({
        success: true,
        verified: true,
        order,
        user,
        licenseKey,
        message: 'Safepay payment verified successfully. Pro license activated!',
      });
    } else {
      return res.status(400).json({
        success: false,
        verified: false,
        order,
        reason: verifyResult.reason || 'Payment verification failed with Safepay.',
      });
    }
  } catch (err) {
    console.error('[Verify Payment Error]:', err);
    return res.status(500).json({ error: err.message || 'Payment verification error' });
  }
});

/**
 * POST /api/v1/payments/webhook
 * Handles incoming asynchronous webhook notifications from Safepay.
 * Implements HMAC-SHA256 signature verification & event deduplication.
 */
router.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
  const signature = req.headers['x-sfpy-signature'] || req.headers['X-SFPY-SIGNATURE'];
  const timestamp = req.headers['x-sfpy-timestamp'] || req.headers['X-SFPY-TIMESTAMP'];
  const eventId = req.headers['x-sfpy-event-id'] || req.headers['X-SFPY-EVENT-ID'];

  const rawBody = req.rawBody || req.body;

  // 1. Signature Verification
  if (safepayConfig.webhookSecret) {
    const isValid = verifyWebhookSignature({
      rawBody,
      signature,
      timestamp,
      webhookSecret: safepayConfig.webhookSecret,
    });

    if (!isValid) {
      console.warn('[Safepay Webhook]: Invalid HMAC signature detected. Dropping request.');
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    }
  }

  // 2. Event Deduplication (Idempotency)
  if (eventId) {
    if (processedWebhookEvents.has(eventId)) {
      return res.status(200).json({ received: true, deduplicated: true });
    }
    processedWebhookEvents.add(eventId);
    // Keep set bounded
    if (processedWebhookEvents.size > 10000) {
      const oldest = Array.from(processedWebhookEvents).slice(0, 5000);
      oldest.forEach((id) => processedWebhookEvents.delete(id));
    }
  }

  // 3. Parse JSON Body
  let payload = {};
  try {
    payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : JSON.parse(rawBody.toString('utf-8'));
  } catch {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }

  const trackerToken = payload.data?.token || payload.data?.tracker?.token || payload.tracker_token;
  const orderId = payload.data?.order_id || payload.order_id;
  const eventType = payload.event || payload.type || 'payment.success';

  const order = findOrderById(orderId) || findOrderByTracker(trackerToken);
  if (order) {
    if (eventType.includes('success') || eventType.includes('completed') || payload.data?.state === 'TRACKER_ENDED') {
      markOrderPaid(
        order.id,
        payload.data?.token || `TXN-SF-WH-${Date.now().toString(36)}`,
        'Safepay Webhook'
      );
    } else if (eventType.includes('failed')) {
      markOrderFailed(order.id, payload.data?.error || 'Webhook reported payment failure');
    }
  }

  return res.status(200).json({ received: true });
});

/**
 * GET /api/v1/payments/order/:orderId
 * Fetches order receipt & live status
 */
router.get('/order/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = findOrderById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json({ success: true, order });
});

/**
 * POST /api/v1/payments/cancel
 * Handles customer cancellation callback
 */
router.post('/cancel', (req, res) => {
  const { orderId } = req.body || {};
  if (orderId) {
    markOrderCancelled(orderId);
  }
  return res.json({ success: true, message: 'Order marked as cancelled' });
});

export default router;
