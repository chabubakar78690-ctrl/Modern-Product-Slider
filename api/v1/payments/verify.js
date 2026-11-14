import {
  findOrderById,
  findOrderByTracker,
  markOrderPaid,
  db,
} from '../_db.js';
import { applySecurityHeaders } from '../_security.js';
import { verifyTrackerStatus } from '../../server/safepay.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { orderId, trackerToken } = body;

    if (!orderId && !trackerToken) {
      return res.status(400).json({ error: 'Missing orderId or trackerToken.' });
    }

    const order = findOrderById(orderId) || findOrderByTracker(trackerToken);
    if (!order) {
      return res.status(404).json({ error: 'Order not found in database.' });
    }

    // Idempotent return if already paid
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

    // Direct server-to-server check with Safepay
    const verifyResult = await verifyTrackerStatus({
      trackerToken: trackerToken || order.trackerToken,
      orderId: order.id,
      expectedAmount: order.amountLowestDenom,
    });

    if (verifyResult.verified) {
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
}
