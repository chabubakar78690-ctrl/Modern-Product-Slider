import { db, generateKey } from '../_db.js';
import {
  applySecurityHeaders,
  getClientIp,
  isValidEmail,
} from '../_security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const clientIp = getClientIp(req);
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const email = String(body.email || '').trim().toLowerCase();
  const planId = body.planId === 'single' ? 'single' : 'unlimited';
  const rotateOnly = Boolean(body.rotateOnly);

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Valid customer email required for checkout.' });
  }

  let user = db.users.get(email);
  if (!user) {
    user = {
      id: 'usr_' + Math.random().toString(36).slice(2, 8),
      name: email.split('@')[0],
      email,
      role: 'customer',
      provider: 'email',
      planId: 'free',
      planName: 'Free Edition ($0/mo)',
      price: 0,
      apiKey: '',
      maxSites: 0,
      activeSites: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
  }

  // Key rotation action
  if (rotateOnly && user.apiKey) {
    user.apiKey = generateKey(user.planId);
    db.users.set(email, user);
    db.logs.unshift({
      id: Date.now(),
      event: 'API Key Rotated',
      detail: `${email} generated a new Pro license key`,
      time: 'Just now',
      ok: true,
    });
    db.persist();
    return res.status(200).json({ success: true, user });
  }

  // Pro Upgrade
  const price = planId === 'single' ? 3 : 10;
  const planName = planId === 'single' ? 'Single Site ($3/mo)' : 'Unlimited Sites ($10/mo)';
  user.planId = planId;
  user.planName = planName;
  user.price = price;
  user.maxSites = planId === 'single' ? 1 : -1;
  user.apiKey = generateKey(planId);
  user.status = 'active';
  db.users.set(email, user);

  db.transactions.unshift({
    id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
    email,
    plan: planName,
    amount: price,
    method: body.paymentMethod || 'Card •••• 4242',
    status: 'Paid',
    date: new Date().toISOString().slice(0, 10),
  });

  db.logs.unshift({
    id: Date.now(),
    event: 'Pro Subscription Activated',
    detail: `${email} upgraded to ${planName} (IP: ${clientIp})`,
    time: 'Just now',
    ok: true,
  });
  db.persist();

  return res.status(200).json({ success: true, user });
}
