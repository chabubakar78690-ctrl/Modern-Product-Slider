import { db, generateKey } from '../_db.js';
import {
  applySecurityHeaders,
  getClientIp,
  verifyAdminAccess,
} from '../_security.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Handle Admin Mutation Actions
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { action, email, planId, status, domain } = body;
    const cleanEmail = String(email || '').toLowerCase().trim();
    const target = db.users.get(cleanEmail);

    if (action === 'create_or_upgrade' && cleanEmail) {
      const price = planId === 'single' ? 3 : 10;
      const planName = planId === 'single' ? 'Single Site ($3/mo)' : 'Unlimited Sites ($10/mo)';
      const maxSites = planId === 'single' ? 1 : -1;
      const apiKey = generateKey(planId);
      const userObj = {
        id: target ? target.id : 'usr_' + Math.random().toString(36).slice(2, 8),
        name: body.name || (target ? target.name : cleanEmail.split('@')[0]),
        email: cleanEmail,
        role: target ? target.role : 'customer',
        provider: body.paymentMethod || 'Google ID Payment',
        planId,
        planName,
        price,
        apiKey,
        maxSites,
        activeSites: target ? target.activeSites : [],
        status: 'active',
        createdAt: target ? target.createdAt : new Date().toISOString(),
      };
      db.users.set(cleanEmail, userObj);
      db.transactions.unshift({
        id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
        email: cleanEmail,
        plan: planName,
        amount: price,
        method: body.paymentMethod || 'Google ID Payment',
        status: 'Paid',
        date: new Date().toISOString().slice(0, 10),
      });
      db.logs.unshift({
        id: Date.now(),
        event: 'Manual License Issued',
        detail: `Admin issued ${planName} to ${cleanEmail} via ${body.paymentMethod || 'Google ID'}`,
        time: 'Just now',
        ok: true,
      });
      db.persist();
    } else if (target) {
      if (action === 'change_plan') {
        target.planId = planId;
        target.planName =
          planId === 'single'
            ? 'Single Site ($3/mo)'
            : planId === 'unlimited'
            ? 'Unlimited Sites ($10/mo)'
            : 'Free Edition ($0/mo)';
        target.price = planId === 'single' ? 3 : planId === 'unlimited' ? 10 : 0;
        target.maxSites = planId === 'single' ? 1 : planId === 'unlimited' ? -1 : 0;
        target.apiKey = planId === 'free' ? '' : target.apiKey || generateKey(planId);
      } else if (action === 'toggle_status') {
        target.status = status || (target.status === 'active' ? 'suspended' : 'active');
      } else if (action === 'reset_sites') {
        target.activeSites = [];
      } else if (action === 'remove_site' && domain) {
        target.activeSites = (target.activeSites || []).filter((d) => d !== domain);
      } else if (action === 'delete_user') {
        db.users.delete(target.email);
      }
      db.persist();
    }
  }

  const users = Array.from(db.users.values());
  const proUsers = users.filter((u) => u.planId !== 'free' && u.status === 'active');
  const mrr = proUsers.reduce((sum, u) => sum + (u.price || 0), 0);
  const totalActiveDomains = users.reduce((sum, u) => sum + (u.activeSites?.length || 0), 0);

  return res.status(200).json({
    metrics: {
      totalUsers: users.length,
      proSubscribers: proUsers.length,
      mrr,
      totalActiveDomains,
    },
    users,
    transactions: db.transactions,
    logs: db.logs.slice(0, 25),
  });
}
