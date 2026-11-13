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
        lastActiveAt: new Date().toISOString(),
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
    } else if (action === 'add_api') {
      // Super Admin add API service or key
      const newApi = {
        id: 'api_' + Math.random().toString(36).slice(2, 9),
        name: body.apiName || 'Custom Cloud API',
        service: body.apiService || 'Payment / Auth',
        keyMasked: body.apiKey ? body.apiKey.slice(0, 8) + '••••••••' + body.apiKey.slice(-4) : 'mps_live_••••••',
        status: 'active',
        environment: body.environment || 'production',
        createdAt: new Date().toISOString(),
      };
      if (!Array.isArray(db.externalApis)) db.externalApis = [];
      db.externalApis.unshift(newApi);
      db.logs.unshift({
        id: Date.now(),
        event: 'API Added by Admin',
        detail: `New API integration "${newApi.name}" configured`,
        time: 'Just now',
        ok: true,
      });
      db.persist();
    } else if (action === 'delete_api' && body.apiId) {
      if (Array.isArray(db.externalApis)) {
        db.externalApis = db.externalApis.filter((a) => a.id !== body.apiId);
      }
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

  // Pre-seed external APIs if not initialized
  if (!Array.isArray(db.externalApis) || db.externalApis.length === 0) {
    db.externalApis = [
      {
        id: 'api_google_oauth',
        name: 'Google Identity & OAuth 2.0',
        service: 'Google Auth Service',
        keyMasked: '782914109823-mps-oauth••••••••.apps.googleusercontent.com',
        status: 'active',
        environment: 'production',
        createdAt: '2026-11-01T00:00:00Z',
      },
      {
        id: 'api_mastercard_stripe',
        name: 'Mastercard & Visa Gateway (3D Secure)',
        service: 'Stripe / Bank Terminal',
        keyMasked: 'sk_live_51Pq••••••••98xK',
        status: 'active',
        environment: 'production',
        createdAt: '2026-11-01T00:00:00Z',
      },
      {
        id: 'api_pakistan_bank',
        name: 'Pakistani Raast / Direct Bank IBAN Gateway',
        service: 'State Bank Raast / 1Link',
        keyMasked: 'PK92_RAAST_••••••••8172',
        status: 'active',
        environment: 'production',
        createdAt: '2026-11-04T00:00:00Z',
      },
      {
        id: 'api_cloud_verify',
        name: 'WooCommerce Remote Verification Cloud API',
        service: 'Modern Product Slider Licensing API',
        keyMasked: 'mps_live_secret_••••••••8821',
        status: 'active',
        environment: 'production',
        createdAt: '2026-11-01T00:00:00Z',
      },
    ];
  }

  // Analytics detailed payload
  const analyticsReports = {
    dailyRequests: [
      { day: 'Mon', requests: 4120, verified: 4098, rejected: 22 },
      { day: 'Tue', requests: 5240, verified: 5210, rejected: 30 },
      { day: 'Wed', requests: 6180, verified: 6140, rejected: 40 },
      { day: 'Thu', requests: 7890, verified: 7850, rejected: 40 },
      { day: 'Fri', requests: 8450, verified: 8405, rejected: 45 },
      { day: 'Sat', requests: 9210, verified: 9170, rejected: 40 },
      { day: 'Sun', requests: 10420, verified: 10385, rejected: 35 },
    ],
    geographicDistribution: [
      { country: 'Pakistan (PK)', count: 48, percentage: '48%' },
      { country: 'United States (US)', count: 24, percentage: '24%' },
      { country: 'United Kingdom (UK)', count: 12, percentage: '12%' },
      { country: 'United Arab Emirates (UAE)', count: 9, percentage: '9%' },
      { country: 'Canada & Others', count: 7, percentage: '7%' },
    ],
    domainConnectionsTotal: totalActiveDomains,
    avgResponseLatencyMs: 42,
    apiUptime: '99.99%',
  };

  return res.status(200).json({
    metrics: {
      totalUsers: users.length,
      proSubscribers: proUsers.length,
      mrr,
      totalActiveDomains,
    },
    users,
    transactions: db.transactions,
    logs: db.logs.slice(0, 30),
    externalApis: db.externalApis,
    analyticsReports,
  });
}
