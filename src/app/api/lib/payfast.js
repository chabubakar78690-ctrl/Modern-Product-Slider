// PayFast helpers — https://developers.payfast.co.za/docs
// Checkout: HTML form POST to https://sandbox.payfast.co.za/eng/process
// (live: https://www.payfast.co.za/eng/process) with merchant_id, merchant_key,
// return_url, cancel_url, notify_url, amount, item_name, plus an MD5 signature
// built from the url-encoded fields in order, + &passphrase=... when set.
// The signature MUST be generated server-side — never in the browser.
//
// ITN (Instant Transaction Notification): PayFast POSTs the result to notify_url.
// It is the only authoritative payment proof. Verify with PayFast's 4 checks:
//  1. Signature — MD5 over the posted fields (+ passphrase) matches.
//  2. Source IP — the request comes from a PayFast IP (www.payfast.co.za,
//     sandbox.payfast.co.za, w1w.payfast.co.za, w2w.payfast.co.za).
//  3. Server confirmation — post the ITN back to PayFast; it must reply VALID.
//  4. Merchant + amount — merchant_id and amount_gross match the order.
import crypto from 'crypto';

export const PAYFAST_SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process';
export const PAYFAST_LIVE_URL = 'https://www.payfast.co.za/eng/process';
export const PAYFAST_SANDBOX_MERCHANT_ID = '10000100';
export const PAYFAST_SANDBOX_MERCHANT_KEY = '46f0cd694581a';
export const PAYFAST_VALIDATE_URL = 'https://sandbox.payfast.co.za/eng/query/validate';

export function buildSignature(fields, passphrase = '') {
  const str = Object.keys(fields)
    .filter((k) => fields[k] !== undefined && fields[k] !== '' && k !== 'signature')
    .map((k) => `${k}=${encodeURIComponent(String(fields[k])).replace(/%20/g, '+')}`)
    .join('&');
  const withPass = passphrase ? `${str}&passphrase=${encodeURIComponent(passphrase)}` : str;
  return crypto.createHash('md5').update(withPass).digest('hex');
}

export function buildCheckoutFields({ merchantId, merchantKey, amount, itemName, returnUrl, cancelUrl, notifyUrl, email, passphrase }) {
  const fields = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    name_first: '',
    email_address: email || '',
    m_payment_id: `MPS-${Date.now()}`,
    amount: Number(amount).toFixed(2),
    item_name: itemName,
  };
  fields.signature = buildSignature(fields, passphrase || '');
  return fields;
}

export async function verifyItnSignature(form, passphrase = '') {
  const { signature, ...rest } = form;
  if (!signature) return false;
  return buildSignature(rest, passphrase) === signature;
}

export async function resolvePayfastHosts() {
  // Resolve PayFast's hostnames to IPs for the source-IP check (check 2).
  const dns = await import('dns').then((m) => m.promises).catch(() => null);
  if (!dns) return [];
  const hosts = ['www.payfast.co.za', 'sandbox.payfast.co.za', 'w1w.payfast.co.za', 'w2w.payfast.co.za'];
  const ips = new Set();
  for (const h of hosts) {
    try { const found = await dns.lookup(h, { all: true }); found.forEach((r) => ips.add(r.address)); } catch {}
  }
  return [...ips];
}

export async function confirmWithPayfast(form, sandbox = true) {
  // Check 3: post the exact ITN body back to PayFast; it must reply VALID.
  const url = sandbox ? 'https://sandbox.payfast.co.za/eng/query/validate' : 'https://www.payfast.co.za/eng/query/validate';
  try {
    const body = new URLSearchParams(form).toString();
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const text = (await res.text()).trim();
    return text === 'VALID';
  } catch { return false; }
}
