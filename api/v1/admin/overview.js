import { db, generateKey } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { action, email, planId, status, domain } = body;
    const target = db.users.get(String(email || '').toLowerCase());

    if (target) {
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
        target.activeSites = target.activeSites.filter((d) => d !== domain);
      } else if (action === 'delete_user') {
        db.users.delete(target.email);
      }
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
    logs: db.logs.slice(0, 15),
  });
}
