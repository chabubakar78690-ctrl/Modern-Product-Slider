// Shared demo store for the Modern Product Slider dashboard.
// Front-end only for now: data lives in localStorage so the admin and
// customer views stay in sync in this demo. Real auth, licence checks and
// PayFast verification must run on a server (see Settings > PayFast).

export const PLANS_SEED = [
  { id: 'free', name: 'Free', price: 0, sites: '1 site', desc: 'For trying Modern Product Slider on your store.', features: ['Limited product sliders', 'Responsive slider layouts', 'Shortcode & Gutenberg block'] },
  { id: 'single', name: 'Single Site', price: 3, sites: '1 site', desc: 'Ideal for a single WooCommerce storefront.', features: ['Activate on 1 WordPress Site', 'Unlimited Product Sliders', 'Unlimited Products Per Rack', 'Instant Pro Add-On ZIP Download', 'Cancel Anytime from Dashboard'] },
  { id: 'unlimited', name: 'Unlimited Sites', price: 10, sites: 'Unlimited sites', desc: 'Built for agencies, studios & multi-brand owners.', features: ['Activate on Unlimited Sites', 'Unlimited Product Sliders', 'Unlimited Products Per Rack', 'Instant Pro Add-On ZIP Download', 'Priority Developer Support'] },
];

export const SEED = {
  plans: PLANS_SEED,
  profile: { name: 'Abubakar', email: 'chabubakar78690@gmail.com', store: 'Modern Product Slider', role: 'admin' },
  customer: { name: 'Sara Ahmed', email: 'sara@fashionstore.com', plan: 'single', planName: 'Single Site', renews: '2026-12-17', status: 'Active' },
  licenses: [
    { id: 'LIC-1001', key: 'MPS-9F3K-28XD-71QZ', plan: 'Single Site', domain: 'saras-fashion.com', status: 'Active', sites: 1, version: '2.1.0', created: '2026-11-10', lastCheck: '2026-11-17 09:41' },
    { id: 'LIC-1002', key: 'MPS-7B2M-94PL-03RT', plan: 'Unlimited Sites', domain: 'agency.davidchen.studio', status: 'Active', sites: 5, version: '2.1.0', created: '2026-11-02', lastCheck: '2026-11-17 08:15' },
    { id: 'LIC-1003', key: 'MPS-4H8N-12QW-66JK', plan: 'Single Site', domain: 'bilal-electronics.pk', status: 'Expired', sites: 1, version: '2.0.0', created: '2026-10-05', lastCheck: '2026-11-01 11:02' },
  ],
  users: [
    { name: 'Sara Ahmed', email: 'sara@fashionstore.com', plan: 'Single Site', status: 'Active', joined: '2026-11-10', licenses: 1 },
    { name: 'David Chen', email: 'david@wpstudio.agency', plan: 'Unlimited Sites', status: 'Active', joined: '2026-11-02', licenses: 1 },
    { name: 'Bilal Khan', email: 'bilal@electronics.pk', plan: 'Single Site', status: 'Expired', joined: '2026-10-05', licenses: 1 },
    { name: 'Maria Lopez', email: 'maria@beauty.store', plan: 'Free', status: 'Active', joined: '2026-11-15', licenses: 0 },
    { name: 'Emma Wilson', email: 'emma@agency.co', plan: 'Unlimited Sites', status: 'Active', joined: '2026-11-12', licenses: 2 },
  ],
  payments: [
    { id: 'PF-88231', date: '2026-11-10', user: 'Sara Ahmed', plan: 'Single Site', amount: 3.0, method: 'PayFast', status: 'Completed' },
    { id: 'PF-88190', date: '2026-11-02', user: 'David Chen', plan: 'Unlimited Sites', amount: 10.0, method: 'PayFast', status: 'Completed' },
    { id: 'PF-88112', date: '2026-11-15', user: 'Emma Wilson', plan: 'Unlimited Sites', amount: 10.0, method: 'PayFast', status: 'Completed' },
    { id: 'PF-88054', date: '2026-10-05', user: 'Bilal Khan', plan: 'Single Site', amount: 3.0, method: 'PayFast', status: 'Refunded' },
  ],
  versions: [
    { version: '2.1.0', date: '2026-11-14', file: 'modern-product-slider-pro-2.1.0.zip', size: '1.8 MB', current: true, notes: 'New rack layouts, faster lazy loading, Elementor widget fixes.' },
    { version: '2.0.0', date: '2026-10-28', file: 'modern-product-slider-pro-2.0.0.zip', size: '1.7 MB', current: false, notes: 'Pro add-on launch: unlimited sliders, licence activation.' },
    { version: '1.4.2', date: '2026-10-10', file: 'modern-product-slider-1.4.2.zip', size: '1.2 MB', current: false, notes: 'Free version bug fixes and accessibility improvements.' },
  ],
  // Free plugin (built from wordpress-plugin/ on every deploy).
  freeVersion: { version: '1.0.0', file: 'modern-product-slider-free.zip', size: '—', date: '2026-11-18', notes: 'Free version: WooCommerce product sliders via shortcode and Gutenberg block, with license connect and update checker.' },
  settings: {
    oauth: {
      google: { enabled: true, clientId: '', clientSecret: '', redirect: 'https://modern-product-slider.vercel.app/api/auth/google/callback' },
      facebook: { enabled: false, clientId: '', clientSecret: '', redirect: 'https://modern-product-slider.vercel.app/api/auth/facebook/callback' },
      apple: { enabled: false, clientId: '', clientSecret: '', redirect: 'https://modern-product-slider.vercel.app/api/auth/apple/callback' },
    },
    payfast: {
      enabled: true, sandbox: true,
      merchantId: '10000100', merchantKey: '46f0cd694581a', passphrase: '',
      returnUrl: 'https://modern-product-slider.vercel.app/dashboard/billing?payfast=success',
      cancelUrl: 'https://modern-product-slider.vercel.app/dashboard/billing?payfast=cancelled',
      notifyUrl: 'https://modern-product-slider.vercel.app/api/payfast/itn',
    },
  },
  notifications: [
    { id: 1, text: 'New Pro sale — Emma Wilson upgraded to Unlimited Sites ($10/mo).', time: '2h ago', unread: true },
    { id: 2, text: 'Plugin v2.1.0 is live — 3 stores updated from the WordPress dashboard.', time: '5h ago', unread: true },
    { id: 3, text: 'PayFast sandbox test payment completed for order PF-88231.', time: 'Yesterday', unread: false },
  ],
};

// PayFast facts (developers.payfast.co.za / payfast.io/documentation):
// - Checkout is an HTML form POST to https://sandbox.payfast.co.za/eng/process
//   (live: https://www.payfast.co.za/eng/process) with merchant_id, merchant_key,
//   return_url, cancel_url, notify_url, amount, item_name and an MD5 signature.
// - The MD5 signature is built from the url-encoded fields in order, plus
//   &passphrase=... when a passphrase is set. It must be generated server-side.
// - Sandbox test credentials: merchant ID 10000100, merchant key 46f0cd694581a.
// - The ITN (Instant Transaction Notification) is a server-to-server POST to
//   notify_url and is the only authoritative payment proof. Verify it with
//   PayFast's four checks: signature, source IP, server confirmation (VALID),
//   and merchant_id + amount match. Never trust the return redirect alone.
// - PayFast is a South African gateway: a live merchant account needs South
//   African business/bank details. Sandbox works for testing from anywhere.
export const PAYFAST = {
  sandboxUrl: 'https://sandbox.payfast.co.za/eng/process',
  liveUrl: 'https://www.payfast.co.za/eng/process',
  sandboxMerchantId: '10000100',
  sandboxMerchantKey: '46f0cd694581a',
  docs: 'https://developers.payfast.co.za/docs',
};

const KEY = 'mps-dashboard-v1';

export function loadStore() {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) { window.localStorage.setItem(KEY, JSON.stringify(SEED)); return SEED; }
    const parsed = JSON.parse(raw);
    return { ...SEED, ...parsed, settings: { ...SEED.settings, ...(parsed.settings || {}), oauth: { ...SEED.settings.oauth, ...((parsed.settings || {}).oauth || {}) }, payfast: { ...SEED.settings.payfast, ...((parsed.settings || {}).payfast || {}) } } };
  } catch { return SEED; }
}

export function saveStore(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('mps-store'));
}

export function resetStore() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(SEED));
  window.dispatchEvent(new Event('mps-store'));
}
