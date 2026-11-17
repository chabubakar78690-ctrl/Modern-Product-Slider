// PayFast API.
// POST /api/payfast/checkout {planId} -> signed checkout form for PayFast.
//   Signed-in only. The MD5 signature is built here, server-side, from the
//   order fields + passphrase. The browser then posts the form to PayFast.
// POST /api/payfast/itn -> Instant Transaction Notification webhook.
//   PayFast posts every payment result here. Runs the 4 security checks
//   (signature, source IP, server confirmation VALID, merchant + amount)
//   and only then records the payment and activates the buyer's license.
//   Always returns HTTP 200 so PayFast does not retry.
import { getDb, getSettings, isDemoMode } from '../../lib/db';
import { requireUser, json } from '../../lib/auth';
import { buildCheckoutFields, verifyItnSignature, resolvePayfastHosts, confirmWithPayfast, PAYFAST_SANDBOX_URL, PAYFAST_LIVE_URL, PAYFAST_SANDBOX_MERCHANT_ID, PAYFAST_SANDBOX_MERCHANT_KEY } from '../../lib/payfast';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const action = params.action?.[0];
  const db = getDb();

  if (action === 'checkout') {
    const { session, error } = requireUser(req);
    if (error) return error;
    const body = await req.json().catch(() => ({}));
    const { payfast, plans } = await getSettings();
    const plan = plans.find((p) => p.id === body.planId) || plans.find((p) => p.id === 'single');
    if (!plan || plan.price <= 0) return json({ error: 'Choose a paid plan first.' }, 400);
    const sandbox = payfast.sandbox !== false;
    const fields = buildCheckoutFields({
      merchantId: sandbox ? PAYFAST_SANDBOX_MERCHANT_ID : (payfast.merchantId || ''),
      merchantKey: sandbox ? PAYFAST_SANDBOX_MERCHANT_KEY : (payfast.merchantKey || ''),
      amount: plan.price,
      itemName: `Modern Product Slider — ${plan.name}`,
      returnUrl: payfast.returnUrl,
      cancelUrl: payfast.cancelUrl,
      notifyUrl: payfast.notifyUrl,
      email: session.email,
      passphrase: sandbox ? '' : (payfast.passphrase || ''),
    });
    return json({ ok: true, demo: isDemoMode(), action: sandbox ? PAYFAST_SANDBOX_URL : PAYFAST_LIVE_URL, fields });
  }

  if (action === 'itn') {
    // Parse the url-encoded ITN body exactly as posted.
    const raw = await req.text();
    const form = Object.fromEntries(new URLSearchParams(raw));
    const { payfast } = await getSettings();
    const sandbox = payfast.sandbox !== false;

    // Check 1 — signature.
    const sigOk = await verifyItnSignature(form, sandbox ? '' : (payfast.passphrase || ''));
    // Check 2 — source IP.
    const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const payfastIps = await resolvePayfastHosts();
    const ipOk = !forwarded || payfastIps.length === 0 || payfastIps.includes(forwarded);
    // Check 3 — server confirmation.
    const confirmed = await confirmWithPayfast(form, sandbox);
    // Check 4 — merchant + amount match a plan.
    const { plans } = await getSettings();
    const amountOk = plans.some((p) => Number(p.price).toFixed(2) === Number(form.amount_gross || 0).toFixed(2));
    const merchantOk = String(form.merchant_id) === String(sandbox ? PAYFAST_SANDBOX_MERCHANT_ID : payfast.merchantId);

    if (!sigOk || !ipOk || !confirmed || !amountOk || !merchantOk) {
      console.warn('PayFast ITN rejected', { sigOk, ipOk, confirmed, amountOk, merchantOk });
      return new Response('OK', { status: 200 });
    }

    if (form.payment_status === 'COMPLETE') {
      const planName = plans.find((p) => Number(p.price).toFixed(2) === Number(form.amount_gross || 0).toFixed(2))?.name || 'Single Site';
      await db.insert('payments', {
        id: String(form.pf_payment_id || `PF-${Date.now()}`),
        user_email: form.email_address || '',
        plan: planName, amount: Number(form.amount_gross || 0),
        method: 'PayFast', status: 'Completed',
        created_at: new Date().toISOString().slice(0, 10),
      });
      // Activate (or create) the buyer's license.
      const existing = (await db.all('licenses')).find((l) => l.user_email === (form.email_address || ''));
      if (existing) await db.update('licenses', 'key', existing.key, { status: 'Active', plan: planName });
    }
    return new Response('OK', { status: 200 });
  }

  return json({ error: 'Unknown PayFast action' }, 404);
}
