import {
  PLAN_CATALOG,
  createOrder,
  markOrderFailed,
  db,
} from '../_db.js';
import { applySecurityHeaders } from '../_security.js';
import {
  safepayConfig,
  createPaymentTracker,
  buildHostedCheckoutUrl,
} from '../../server/safepay.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { email, name, planId, currency = 'PKR', redirectOrigin } = body;

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
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
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
}
