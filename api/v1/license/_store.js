// In-memory + pre-seeded test license keys for instant Vercel testing.
// For production persistence across cold starts, swap Map lookups with Vercel KV / Upstash Redis / Supabase.

const globalStore = globalThis.__MPS_LICENSE_STORE__ || new Map([
  [
    'mps_test_single_3usd',
    {
      api_key: 'mps_test_single_3usd',
      email: 'demo-single@modernproductslider.com',
      plan: 'Single Site ($3/mo)',
      max_sites: 1,
      active_sites: [],
      status: 'active',
    },
  ],
  [
    'mps_test_unlimited_10usd',
    {
      api_key: 'mps_test_unlimited_10usd',
      email: 'demo-agency@modernproductslider.com',
      plan: 'Unlimited Sites ($10/mo)',
      max_sites: -1,
      active_sites: [],
      status: 'active',
    },
  ],
]);

globalThis.__MPS_LICENSE_STORE__ = globalStore;

export function normalizeDomain(siteUrl = '') {
  try {
    const parsed = new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return String(siteUrl).trim().toLowerCase();
  }
}

export function getOrCreateKey(apiKey) {
  if (globalStore.has(apiKey)) {
    return globalStore.get(apiKey);
  }
  // Support any key generated on the React frontend using prefix convention:
  // mps_live_s1_... -> Single Site (1 site)
  // mps_live_un_... -> Unlimited Sites (-1)
  if (apiKey.startsWith('mps_live_s1_')) {
    const record = {
      api_key: apiKey,
      email: 'customer@modernproductslider.com',
      plan: 'Single Site ($3/mo)',
      max_sites: 1,
      active_sites: [],
      status: 'active',
    };
    globalStore.set(apiKey, record);
    return record;
  }
  if (apiKey.startsWith('mps_live_un_')) {
    const record = {
      api_key: apiKey,
      email: 'agency@modernproductslider.com',
      plan: 'Unlimited Sites ($10/mo)',
      max_sites: -1,
      active_sites: [],
      status: 'active',
    };
    globalStore.set(apiKey, record);
    return record;
  }
  return null;
}

export { globalStore };
