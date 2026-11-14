import {
  findOrderById,
  findOrderByTracker,
  markOrderPaid,
  markOrderFailed,
} from '../_db.js';
import { applySecurityHeaders } from '../_security.js';
import { safepayConfig, verifyWebhookSignature } from '../../server/safepay.js';

const processedWebhookEvents = new Set();

export const config = {
  api: {
    bodyParser: false, // Disabling bodyParser so we can receive raw bytes for HMAC verification
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let rawBody;
    if (req.rawBody) {
      rawBody = req.rawBody;
    } else if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      rawBody = req.body;
    } else {
      rawBody = await getRawBody(req);
    }

    const signature = req.headers['x-sfpy-signature'] || req.headers['X-SFPY-SIGNATURE'];
    const timestamp = req.headers['x-sfpy-timestamp'] || req.headers['X-SFPY-TIMESTAMP'];
    const eventId = req.headers['x-sfpy-event-id'] || req.headers['X-SFPY-EVENT-ID'];

    // 1. Signature Verification
    if (safepayConfig.webhookSecret) {
      const isValid = verifyWebhookSignature({
        rawBody,
        signature,
        timestamp,
        webhookSecret: safepayConfig.webhookSecret,
      });

      if (!isValid) {
        console.warn('[Safepay Webhook]: Invalid HMAC signature detected.');
        return res.status(401).json({ error: 'Invalid webhook signature.' });
      }
    }

    // 2. Event Deduplication
    if (eventId) {
      if (processedWebhookEvents.has(eventId)) {
        return res.status(200).json({ received: true, deduplicated: true });
      }
      processedWebhookEvents.add(eventId);
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
  } catch (err) {
    console.error('[Webhook Processing Error]:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
}
