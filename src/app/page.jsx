'use client';

import { useEffect, useState } from 'react';

const FAQS = [
  { q: 'What is the difference between Free and Pro?', a: 'Free gives you beautiful product sliders for your WooCommerce store with a limited number of sliders. Pro unlocks unlimited sliders, unlimited products per rack, instant Pro Add-On ZIP download, and priority developer support.' },
  { q: 'How do I install the free version?', a: 'From your WordPress dashboard go to Plugins → Add New, search for “Modern Product Slider”, install and activate it. Then create your first slider from the Modern Product Slider menu — no code needed.' },
  { q: 'How does Pro licensing work?', a: 'Buy a plan here, create an account, and download the Pro Add-On ZIP from your dashboard. Upload it in WordPress, then connect your API key. Your key is bound to your site — Single Site covers 1 site, Unlimited covers unlimited sites.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from your dashboard. Your Pro features keep working until the end of the paid month.' },
  { q: 'Does it work with my theme and page builder?', a: 'Yes. Modern Product Slider works with any well-coded WordPress theme, WooCommerce, Gutenberg, and Elementor. Add a slider with a shortcode, Gutenberg block, or Elementor widget.' },
  { q: 'Will it slow down my store?', a: 'No. Sliders are lightweight, load images lazily, and only load their CSS and JavaScript on pages where a slider is shown.' },
  { q: 'Do you offer a refund?', a: 'If Pro does not work on your site as described, contact support from your dashboard and we will help — including a refund where the plugin cannot be made to work on a standard WooCommerce install.' },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const TESTIMONIALS = [
  [
    { quote: 'Our best sellers finally look as good as they sell. Setup took ten minutes.', name: 'Sara Ahmed', role: 'Fashion store owner', initials: 'SA', tone: 'blue' },
    { quote: 'Customers actually swipe through the slider instead of scrolling straight past it.', name: 'Bilal Khan', role: 'Electronics store owner', initials: 'BK', tone: 'navy' },
    { quote: 'The sliders load fast and look clean on mobile. Sales from our best sellers went up.', name: 'Maria Lopez', role: 'Beauty store owner', initials: 'ML', tone: 'sky' },
  ],
  [
    { quote: 'Unlimited sliders on the $10 plan paid for itself on our first agency client.', name: 'David Chen', role: 'WordPress studio owner', initials: 'DC', tone: 'navy' },
    { quote: 'We set up sliders for five client stores in one afternoon. No code at all.', name: 'Emma Wilson', role: 'Agency owner', initials: 'EW', tone: 'blue' },
    { quote: 'Support answered in a few hours and helped us match our theme perfectly.', name: 'Omar Farooq', role: 'Home goods store owner', initials: 'OF', tone: 'sky' },
  ],
  [
    { quote: 'Fast on mobile, clean on desktop, and customers actually swipe through it.', name: 'James Patel', role: 'Grocery store owner', initials: 'JP', tone: 'sky' },
    { quote: 'I tried three slider plugins. This one was the only one that did not slow my store down.', name: 'Ayesha Malik', role: 'Jewellery store owner', initials: 'AM', tone: 'blue' },
    { quote: 'New arrivals finally get seen. Our sale slider paid for Pro in the first week.', name: 'Liam Brown', role: 'Sports store owner', initials: 'LB', tone: 'navy' },
  ],
];

function TestimonialCard({ t }) {
  return (
    <div className="t-card">
      <div className="stars">★★★★★</div>
      <p className="quote">“{t.quote}”</p>
      <div className="t-person">
        <span className={`avatar ${t.tone}`}>{t.initials}</span>
        <div><strong>{t.name}</strong><span>{t.role}</span></div>
      </div>
    </div>
  );
}

function TestimonialCarousel() {
  return (
    <>
      <div className="t-carousel">
        {TESTIMONIALS.map((col, ci) => (
          <div className={`t-col ${ci === 1 ? 'middle' : ''}`} key={ci}>
            <div className={`t-track ${ci === 1 ? 'up' : 'down'}`}>
              {[...col, ...col].map((t, i) => (
                <TestimonialCard t={t} key={`${ci}-${i}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="t-swipe-hint">Swipe to see more reviews →</p>
    </>
  );
}

const SOCIALS = [
  { id: 'google', label: 'Continue with Google', icon: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.3 1.1-4.2 1.1-3.2 0-5.9-2.1-6.8-5.1L1.3 17.1C3.3 21.2 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2L1.3 6.9C.5 8.5 0 10.2 0 12s.5 3.5 1.3 5.1l3.9-2.9z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.9l3.9 2.9c.9-3 3.6-5.1 6.8-5.1z"/></svg>
  ) },
  { id: 'passkey', label: 'Continue with passkey', icon: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0f172a" d="M14.5 3a6 6 0 0 0-5.9 7.2L3 15.8V21h5.2l1-1v-2h2v-2h2l1.2-1.2A6 6 0 1 0 14.5 3zm1.5 5.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
  ) },
  { id: 'facebook', label: 'Continue with Facebook', icon: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 1-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>
  ) },
  { id: 'apple', label: 'Continue with Apple', icon: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#000" d="M16.7 12.9c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.9-1.6 0-3.1 1-4 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.6-1-2.7-3.7zM14.6 5.7c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.8-1.4z"/></svg>
  ) },
];

function AuthModal({ mode, onClose, onSwitch }) {
  const [showAll, setShowAll] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const isLogin = mode === 'login';
  const visibleSocials = showAll ? SOCIALS : SOCIALS.slice(0, 1);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" role="dialog" aria-modal="true" aria-label={isLogin ? 'Log in' : 'Sign up'} onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="auth-logo"><img src="/logo.svg" alt="Modern Product Slider" /></div>
        <h3>{isLogin ? 'Welcome back' : 'Create your account'}</h3>
        <p className="auth-sub">{isLogin ? 'Log in to manage your Pro licence and downloads.' : 'Sign up to get Pro, manage your licence and download the add-on.'}</p>
        <div className="auth-tabs">
          <button className={isLogin ? 'active' : ''} onClick={() => { onSwitch('login'); setAttempted(false); }}>Log in</button>
          <button className={!isLogin ? 'active' : ''} onClick={() => { onSwitch('signup'); setAttempted(false); }}>Sign up</button>
        </div>
        <div className="auth-social">
          {visibleSocials.map((s) => (
            <button key={s.id} type="button" onClick={() => setAttempted(true)}>{s.icon}{s.label}</button>
          ))}
        </div>
        <button className="auth-more" type="button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Less options' : 'More options'}</button>
        <div className="auth-or">OR</div>
        <form onSubmit={(e) => { e.preventDefault(); setAttempted(true); }}>
          {!isLogin && (
            <div className="auth-field"><label htmlFor="auth-name">Full name</label><input id="auth-name" type="text" placeholder="Your name" autoComplete="name" /></div>
          )}
          <div className="auth-field"><label htmlFor="auth-email">Email</label><input id="auth-email" type="email" placeholder="Email" autoComplete="email" required /></div>
          <div className="auth-field"><label htmlFor="auth-password">Password</label><input id="auth-password" type="password" placeholder="Password" autoComplete={isLogin ? 'current-password' : 'new-password'} required minLength={6} /></div>
          <button className="auth-submit" type="submit">Continue</button>
        </form>
        <button className="auth-sso" type="button" onClick={() => setAttempted(true)}>Continue with SSO</button>
        {attempted && (
          <p className="auth-note">Account sign-in is not connected yet — this is the front-end of the popup. Connecting Google, Apple, Facebook and email sign-in is the next step.</p>
        )}
        <p className="auth-terms">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}

function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="acc">
      {items.map((item, i) => (
        <div className={`acc-item ${open === i ? 'open' : ''}`} key={item.q}>
          <button className="acc-btn" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            {item.q}<span>{open === i ? '−' : '+'}</span>
          </button>
          <div className="acc-body"><div className="acc-body-inner">{item.a}</div></div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  useReveal();

  return (
    <>
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitch={setAuthMode} />}
      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="#top" aria-label="Modern Product Slider — home">
            <img src="/logo.svg" alt="Modern Product Slider logo" />
          </a>
          <button className="menu-btn" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
          <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          </nav>
          <div className="nav-actions">
            <button className="btn ghost small" type="button" onClick={() => setAuthMode('login')}>Log in</button>
            <button className="btn blue small" type="button" onClick={() => setAuthMode('signup')}>Get Pro</button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="section" id="pricing">
          <div className="container center reveal">
            <span className="eyebrow">Select your plan</span>
            <h2>Start free. Upgrade when your store grows.</h2>
            <p className="lead">No surprise costs. Cancel anytime from your dashboard.</p>
            <div className="plans">
              <div className="plan">
                <h3>Free</h3>
                <div className="big">$0<small>/forever</small></div>
                <p>For trying Modern Product Slider on your store.</p>
                <ul>
                  <li>Limited product sliders</li>
                  <li>Responsive slider layouts</li>
                  <li>Shortcode &amp; Gutenberg block</li>
                  <li>Community support</li>
                </ul>
                <a className="btn ghost" href="#how">Download Free</a>
              </div>
              <div className="plan">
                <h3>Single Site</h3>
                <div className="big">$3<small>/month</small></div>
                <p>Ideal for a single WooCommerce storefront.</p>
                <ul>
                  <li>Activate on <b>1 WordPress Site</b></li>
                  <li><b>Unlimited</b> Product Sliders</li>
                  <li><b>Unlimited</b> Products Per Rack</li>
                  <li>Instant Pro Add-On ZIP Download</li>
                  <li>Cancel Anytime from Dashboard</li>
                </ul>
                <a className="btn" href="#faq">Get Single Site ($3/mo) →</a>
              </div>
              <div className="plan featured">
                <span className="badge">★ Best Value</span>
                <h3>Unlimited Sites</h3>
                <div className="big">$10<small>/month</small></div>
                <p>Built for agencies, studios &amp; multi-brand owners.</p>
                <ul>
                  <li>Activate on <b>Unlimited Sites</b></li>
                  <li><b>Unlimited</b> Product Sliders</li>
                  <li><b>Unlimited</b> Products Per Rack</li>
                  <li>Instant Pro Add-On ZIP Download</li>
                  <li>Priority Developer Support</li>
                </ul>
                <a className="btn sky" href="#faq">Get Unlimited Plan ($10/mo) →</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section navy">
          <div className="container split reveal">
            <div>
              <span className="eyebrow light">Modern Product Slider Pro</span>
              <h2>Level up your store with Pro</h2>
              <p className="lead">Power your store with the upgraded subscription that includes the Pro Add-On, unlimited sliders, and priority support — all in one place.</p>
              <div className="pro-list">
                <div className="pro-item">
                  <span className="tick">✓</span>
                  <div><strong>Unify your workflow.</strong><p>Create, style and publish sliders from one dashboard.</p></div>
                </div>
                <div className="pro-item">
                  <span className="tick">✓</span>
                  <div><strong>No limits where it matters.</strong><p>Unlimited sliders and unlimited products per rack.</p></div>
                </div>
                <div className="pro-item">
                  <span className="tick">✓</span>
                  <div><strong>Simplify your spend.</strong><p>One simple monthly plan, cancel anytime.</p></div>
                </div>
              </div>
              <div className="cta-left"><a className="btn sky" href="#pricing">See Pro plans</a></div>
            </div>
            <div className="pro-media">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=80" alt="A bright WooCommerce storefront" />
              <div className="pro-stat"><strong>10 min</strong><span>average setup time</span></div>
            </div>
          </div>
        </section>

        <section className="section tint" id="features">
          <div className="container reveal">
            <div className="center">
              <span className="eyebrow">Why Modern Product Slider</span>
              <h2>Build pixel-perfect sliders</h2>
              <p className="lead">From best sellers to new arrivals, gain complete control over how your products look, move and sell.</p>
            </div>
            <div className="grid3">
              <div className="card"><div className="icon">▦</div><h3>Design flexibility</h3><p>Choose a layout, colours, arrows, dots and card style that match your theme — no CSS needed.</p></div>
              <div className="card"><div className="icon">⧉</div><h3>Product racks</h3><p>Show products by category, tag, best sellers, sale items or a hand-picked list. Unlimited products per rack on Pro.</p></div>
              <div className="card"><div className="icon">↔</div><h3>Smooth motion</h3><p>Touch-friendly swiping, autoplay, and smooth transitions that feel native on every device.</p></div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container split reveal">
            <div className="split-media">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&q=80" alt="A customer checking out on a phone" />
            </div>
            <div>
              <span className="eyebrow">Optimise impact at every level</span>
              <h2>Fast, accessible, and built to convert</h2>
              <Accordion items={[
                { q: 'Boost performance', a: 'Sliders load lazily and only load their CSS and JavaScript on pages where a slider is shown, so the rest of your store stays fast.' },
                { q: 'Responsive by default', a: 'Set how many products show on desktop, tablet and mobile. Sliders reflow cleanly — no squashed cards or cut-off prices.' },
                { q: 'Improve accessibility', a: 'Keyboard-friendly arrows, labelled controls, and readable contrast help every shopper browse your products.' },
                { q: 'Optimise images', a: 'Product images use the right WooCommerce thumbnail sizes, so sliders stay sharp without slowing the page.' },
              ]} />
            </div>
          </div>
        </section>

        <section className="section tint" id="how">
          <div className="container reveal">
            <div className="center">
              <span className="eyebrow">How it works</span>
              <h2>Live on your store in three steps</h2>
            </div>
            <div className="steps">
              <div className="step"><span className="step-num">1</span><h3>Install Free</h3><p>Install Modern Product Slider from WordPress.org, or from Plugins → Add New in your dashboard.</p></div>
              <div className="step"><span className="step-num">2</span><h3>Create a slider</h3><p>Pick your products, choose a layout, and preview it live. No code, no settings maze.</p></div>
              <div className="step"><span className="step-num">3</span><h3>Publish &amp; go Pro</h3><p>Add it anywhere with a shortcode, block or widget. Upgrade to Pro for unlimited sliders and sites.</p></div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container reveal">
            <div className="center">
              <span className="eyebrow">Testimonials</span>
              <h2>What our users say</h2>
              <p className="lead">See what our customers have to say about us.</p>
            </div>
            <TestimonialCarousel />
          </div>
        </section>

        <section className="section tint" id="faq">
          <div className="container faq reveal">
            <div className="center">
              <span className="eyebrow">FAQ</span>
              <h2>Frequently asked questions</h2>
              <p className="lead">Have more questions? Contact support from your dashboard after signing up.</p>
            </div>
            <Accordion items={FAQS} />
          </div>
        </section>

        <section className="section cta-section">
          <div className="container reveal">
            <div className="cta">
              <span className="eyebrow light">Build what’s next</span>
              <h2>Make your products impossible to scroll past.</h2>
              <p>Start free today. Upgrade to Pro for $3/month on one site, or $10/month for unlimited sites.</p>
              <a className="btn sky" href="#pricing">Download Free — Get Pro</a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="foot">
            <div>
              <a className="brand" href="#top"><img src="/logo.svg" alt="Modern Product Slider logo" /></a>
              <p>Beautiful, fast WooCommerce product sliders. Free on WordPress.org, Pro from $3/month.</p>
            </div>
            <div><h4>Product</h4><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#how">How it works</a></div>
            <div><h4>Resources</h4><a href="#faq">FAQ</a><a href="#pricing">Download Free</a><a href="#pricing">Get Pro</a></div>
            <div><h4>Company</h4><a href="#top">About</a><a href="#faq">Support</a><a href="#top" onClick={(e) => { e.preventDefault(); setAuthMode('login'); }}>Log in</a></div>
          </div>
          <p className="copy">© 2026 Modern Product Slider. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
