import { PLAN_CATALOG } from '../_db.js';
import { applySecurityHeaders } from '../_security.js';
import { safepayConfig } from '../../server/safepay.js';

export default async function handler(req, res) {
  applySecurityHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    gateway: 'safepay',
    environment: safepayConfig.environment,
    isConfigured: Boolean(safepayConfig.apiKey),
    supportedCurrencies: ['PKR', 'USD'],
    plans: PLAN_CATALOG,
  });
}
