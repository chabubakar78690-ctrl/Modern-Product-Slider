import { findOrderById } from '../_db.js';
import { applySecurityHeaders } from '../_security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const orderId = req.query.orderId || req.query.id;
  if (!orderId) {
    return res.status(400).json({ error: 'orderId parameter is required' });
  }

  const order = findOrderById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.status(200).json({ success: true, order });
}
