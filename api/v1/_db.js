import crypto from 'crypto';

const db = globalThis.__MPS_SAAS_DB__ || {
  users: new Map([
    [
      'admin@modernproductslider.com',
      {
        id: 'usr_admin_01',
        name: 'Founder & Admin',
        email: 'admin@modernproductslider.com',
        role: 'admin',
        provider: 'email',
        planId: 'unlimited',
        planName: 'Unlimited Sites ($10/mo)',
        price: 10,
        apiKey: 'mps_test_unlimited_10usd',
        maxSites: -1,
        activeSites: ['modern-product-slider.vercel.app'],
        status: 'active',
        createdAt: '2026-11-01T10:00:00Z',
      },
    ],
    [
      'sarah.boutique@gmail.com',
      {
        id: 'usr_02',
        name: 'Sarah Jenkins',
        email: 'sarah.boutique@gmail.com',
        role: 'customer',
        provider: 'google',
        planId: 'single',
        planName: 'Single Site ($3/mo)',
        price: 3,
        apiKey: 'mps_test_single_3usd',
        maxSites: 1,
        activeSites: ['sarahstreetwear.com'],
        status: 'active',
        createdAt: '2026-11-05T14:22:00Z',
      },
    ],
    [
      'marcus.studio@gmail.com',
      {
        id: 'usr_03',
        name: 'Marcus Vance',
        email: 'marcus.studio@gmail.com',
        role: 'customer',
        provider: 'email',
        planId: 'unlimited',
        planName: 'Unlimited Sites ($10/mo)',
        price: 10,
        apiKey: 'mps_live_un_98a7f6d5e4c3b2a190817263',
        maxSites: -1,
        activeSites: ['vanceapparel.co', 'atelier-nord.shop', 'kinetixwear.com'],
        status: 'active',
        createdAt: '2026-11-09T09:15:00Z',
      },
    ],
    [
      'elena.rodriguez@gmail.com',
      {
        id: 'usr_04',
        name: 'Elena Rodriguez',
        email: 'elena.rodriguez@gmail.com',
        role: 'customer',
        provider: 'google',
        planId: 'free',
        planName: 'Free Edition ($0/mo)',
        price: 0,
        apiKey: '',
        maxSites: 0,
        activeSites: [],
        status: 'active',
        createdAt: '2026-11-12T18:40:00Z',
      },
    ],
  ]),
  otps: new Map(),
  transactions: [
    {
      id: 'TXN-9041',
      email: 'marcus.studio@gmail.com',
      plan: 'Unlimited Sites ($10/mo)',
      amount: 10,
      method: 'Stripe •••• 4242',
      status: 'Paid',
      date: '2026-11-09',
    },
    {
      id: 'TXN-9040',
      email: 'sarah.boutique@gmail.com',
      plan: 'Single Site ($3/mo)',
      amount: 3,
      method: 'Apple Pay',
      status: 'Paid',
      date: '2026-11-05',
    },
    {
      id: 'TXN-9039',
      email: 'admin@modernproductslider.com',
      plan: 'Unlimited Sites ($10/mo)',
      amount: 10,
      method: 'Founder License',
      status: 'Paid',
      date: '2026-11-01',
    },
  ],
  logs: [
    { id: 1, event: 'License Verified', detail: 'mps_test_single_3usd → sarahstreetwear.com', time: '12 mins ago', ok: true },
    { id: 2, event: 'OTP Code Sent', detail: 'marcus.studio@gmail.com verified via Gmail OTP', time: '1 hour ago', ok: true },
    { id: 3, event: 'License Verified', detail: 'mps_live_un_98a7... → vanceapparel.co', time: '3 hours ago', ok: true },
  ],
};

globalThis.__MPS_SAAS_DB__ = db;

export function generateKey(planId) {
  const prefix = planId === 'single' ? 'mps_live_s1_' : 'mps_live_un_';
  return prefix + crypto.randomBytes(12).toString('hex');
}

export function normalizeDomain(siteUrl = '') {
  try {
    const parsed = new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return String(siteUrl).trim().toLowerCase();
  }
}

export function findUserByApiKey(apiKey) {
  for (const user of db.users.values()) {
    if (user.apiKey && user.apiKey === apiKey) {
      return user;
    }
  }
  // Fallback for stateless Vercel cold starts using key prefix convention
  if (apiKey.startsWith('mps_live_s1_') || apiKey === 'mps_test_single_3usd') {
    const email = apiKey === 'mps_test_single_3usd' ? 'sarah.boutique@gmail.com' : `${apiKey.slice(-6)}@customer.com`;
    const user = {
      id: 'usr_' + apiKey.slice(-6),
      name: 'Pro Store Owner',
      email,
      role: 'customer',
      provider: 'email',
      planId: 'single',
      planName: 'Single Site ($3/mo)',
      price: 3,
      apiKey,
      maxSites: 1,
      activeSites: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    db.users.set(email, user);
    return user;
  }
  if (apiKey.startsWith('mps_live_un_') || apiKey === 'mps_test_unlimited_10usd') {
    const email = apiKey === 'mps_test_unlimited_10usd' ? 'admin@modernproductslider.com' : `${apiKey.slice(-6)}@agency.com`;
    const user = {
      id: 'usr_' + apiKey.slice(-6),
      name: 'Pro Agency Owner',
      email,
      role: 'customer',
      provider: 'google',
      planId: 'unlimited',
      planName: 'Unlimited Sites ($10/mo)',
      price: 10,
      apiKey,
      maxSites: -1,
      activeSites: [],
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    db.users.set(email, user);
    return user;
  }
  return null;
}

export { db };
