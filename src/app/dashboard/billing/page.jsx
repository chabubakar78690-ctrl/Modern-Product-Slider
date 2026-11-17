'use client';

import { useState } from 'react';
import { useDashboard, useRole, money } from '../lib/useStore';
import { PAYFAST } from '../lib/store';

export default function BillingPage() {
  const { data, update } = useDashboard();
  const role = useRole();
  const isAdmin = role === 'admin';
  const [selected, setSelected] = useState('unlimited');
  const [checkout, setCheckout] = useState(false);
  const [done, setDone] = useState('');
  const pf = data.settings.payfast;
  const plan = data.plans.find((p) => p.id === selected) || data.plans[2];
  const endpoint = pf.sandbox ? PAYFAST.sandboxUrl : PAYFAST.liveUrl;

  const pay = () => {
    const id = 'PF-' + Math.floor(88000 + Math.random() * 999);
    update((d) => ({
      ...d,
      payments: [{ id, date: new Date().toISOString().slice(0, 10), user: d.customer.name, plan: plan.name, amount: plan.price, method: 'PayFast', status: 'Completed' }, ...d.payments],
      customer: { ...d.customer, plan: plan.id, planName: plan.name, status: 'Active' },
      licenses: d.licenses.map((l) => l.domain === 'saras-fashion.com' ? { ...l, plan: plan.name, status: 'Active' } : l),
    }));
    setCheckout(false);
    setDone(`Sandbox test payment ${id} completed via PayFast (${money(plan.price)}). Your ${plan.name} plan is now active and your license has been re-activated. In production, PayFast confirms this through the ITN webhook — never from the redirect alone.`);
  };

  const startCheckout = async () => {
    // Real checkout: the server builds the signed PayFast form, then the
    // browser posts it to PayFast's sandbox. Falls back to the simulation
    // below when not signed in / backend unavailable.
    try {
      const res = await fetch('/api/payfast/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: plan.id }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.action && d.fields) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = d.action;
        Object.entries(d.fields).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden'; input.name = k; input.value = String(v);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }
      if (res.status === 401) setDone('Please sign in first (use the Log in button on the website), then try the checkout again.');
    } catch {}
    setCheckout(true);
  };

  return (
    <>
      {done && <p className="dash-note green">{done}</p>}
      <p className="dash-note blue">
        Payments run through <b>PayFast</b> ({pf.sandbox ? 'Sandbox — test mode' : 'Live'}). Checkout posts a signed HTML form to <code>{endpoint}</code>.
        The MD5 signature is generated on the server from the order fields plus your passphrase — it is never built in the browser.
        PayFast then confirms the payment server-to-server with an <b>ITN</b> to your notify URL; the ITN (with its 4 security checks) is the only proof of payment.
        Docs: <a href={PAYFAST.docs} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }}>developers.payfast.co.za</a>
        {!isAdmin && <><br />Note: PayFast is a South African gateway — a live merchant account needs South African business/bank details. Sandbox testing works from anywhere.</>}
      </p>

      {!isAdmin && (
        <>
          <div className="dash-grid three">
            <div className="dash-card stat"><div className="s-label">Current plan</div><div className="s-num" style={{ fontSize: 22 }}>{data.customer.planName}</div><div className="s-sub">{data.customer.status} · renews {data.customer.renews}</div></div>
            <div className="dash-card stat"><div className="s-label">Monthly cost</div><div className="s-num">{money(data.plans.find((p) => p.id === data.customer.plan)?.price || 3)}/mo</div><div className="s-sub">Charged via PayFast</div></div>
            <div className="dash-card stat"><div className="s-label">Payment method</div><div className="s-num" style={{ fontSize: 22 }}>PayFast</div><div className="s-sub">{pf.sandbox ? 'Sandbox test mode' : 'Live mode'}</div></div>
          </div>

          <div className="dash-card" style={{ marginBottom: 20 }}>
            <h3>Upgrade your plan</h3>
            <p style={{ marginBottom: 16 }}>Choose a plan — you will be taken to PayFast&apos;s secure checkout. Your license upgrades automatically once PayFast confirms the payment.</p>
            <div className="dash-grid three" style={{ marginBottom: 0 }}>
              {data.plans.filter((p) => p.price > 0).map((p) => (
                <div key={p.id} className="dash-card" style={{ border: selected === p.id ? '2px solid #0ea5e9' : '1px solid #e2e8f0', cursor: 'pointer' }} onClick={() => setSelected(p.id)}>
                  <h3>{p.name}</h3><p style={{ fontSize: 24, fontWeight: 800, color: '#081a3d' }}>{money(p.price)}<small style={{ fontSize: 13, fontWeight: 400 }}>/month</small></p>
                  <p>{p.desc}</p>
                  <p style={{ marginTop: 8, fontSize: 13 }}>{p.sites} · {p.features[0]}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="dash-btn navy" onClick={startCheckout}>Pay {money(plan.price)} with PayFast {pf.sandbox ? '(Sandbox)' : ''}</button>
              <span style={{ fontSize: 13, color: '#5b6b82', alignSelf: 'center' }}>Secure checkout on payfast.co.za · cards, EFT &amp; more</span>
            </div>
          </div>

          {checkout && (
            <div className="dash-card" style={{ marginBottom: 20, border: '2px solid #0ea5e9' }}>
              <h3>Sandbox test checkout</h3>
              <p style={{ marginBottom: 12 }}>This is the form that would be posted to PayFast in production. In this demo the signature is generated on the server, so here we simulate the sandbox round-trip:</p>
              <div className="dash-kv" style={{ marginBottom: 16 }}>
                <div><b>Endpoint</b>{endpoint}</div>
                <div><b>Merchant ID</b><span className="mono">{pf.sandbox ? PAYFAST.sandboxMerchantId : pf.merchantId}</span></div>
                <div><b>Item</b>Modern Product Slider — {plan.name}</div>
                <div><b>Amount</b>{money(plan.price)} ZAR</div>
                <div><b>Return URL</b><span style={{ fontSize: 12, wordBreak: 'break-all' }}>{pf.returnUrl}</span></div>
                <div><b>Notify (ITN) URL</b><span style={{ fontSize: 12, wordBreak: 'break-all' }}>{pf.notifyUrl}</span></div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="dash-btn blue" onClick={pay}>Confirm sandbox payment</button>
                <button className="dash-btn ghost" onClick={() => setCheckout(false)}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="dash-card">
        <div className="card-head"><h3>{isAdmin ? 'All payments' : 'Payment history'}</h3><span className="badge blue">{data.payments.length} payments</span></div>
        <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>Payment</th><th>Date</th><th>Customer</th><th>Plan</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead><tbody>
          {(isAdmin ? data.payments : data.payments.filter((p) => p.user === data.customer.name)).map((p) => (
            <tr key={p.id}><td className="mono">{p.id}</td><td>{p.date}</td><td>{p.user}</td><td>{p.plan}</td><td>{money(p.amount)}</td><td>{p.method}</td><td><span className={`badge ${p.status === 'Completed' ? 'green' : 'red'}`}>{p.status}</span></td></tr>
          ))}
        </tbody></table></div>
      </div>
    </>
  );
}
