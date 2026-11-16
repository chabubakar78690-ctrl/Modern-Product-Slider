'use client';

import { useEffect, useState } from 'react';

const PRODUCTS = [
  { name: 'Wireless Headphones', cat: 'Audio', price: '$89.00', old: '$129.00', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { name: 'Classic Watch', cat: 'Accessories', price: '$149.00', old: '$199.00', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
  { name: 'Running Sneakers', cat: 'Footwear', price: '$119.00', old: '$159.00', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' },
  { name: 'Sunglasses', cat: 'Accessories', price: '$59.00', old: '$79.00', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80' },
  { name: 'Travel Backpack', cat: 'Bags', price: '$79.00', old: '$99.00', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' },
  { name: 'Instant Camera', cat: 'Electronics', price: '$99.00', old: '$139.00', img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80' },
];

const FAQS = [
  { q: 'What is the difference between Free and Pro?', a: 'Free gives you beautiful product sliders for your WooCommerce store with a limited number of sliders. Pro unlocks unlimited sliders, unlimited products per rack, instant Pro Add-On ZIP download, and priority developer support.' },
  { q: 'How do I install the free version?', a: 'From your WordPress dashboard go to Plugins → Add New, search for “Modern Product Slider”, install and activate it. Then create your first slider from the Modern Product Slider menu — no code needed.' },
  { q: 'How does Pro licensing work?', a: 'Buy a plan here, create an account, and download the Pro Add-On ZIP from your dashboard. Upload it in WordPress, then connect your API key. Your key is bound to your site — Single Site covers 1 site, Unlimited covers unlimited sites.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from your dashboard. Your Pro features keep working until the end of the paid month.' },
  { q: 'Does it work with my theme and page builder?', a: 'Yes. Modern Product Slider works with any well-coded WordPress theme, WooCommerce, Gutenberg, and Elementor. Add a slider with a shortcode, Gutenberg block, or Elementor widget.' },
  { q: 'Will it slow down my store?', a: 'No. Sliders are lightweight, load images lazily, and only load their CSS and JavaScript on pages where a slider is shown.' },
  { q: 'Do you offer a refund?', a: 'If Pro does not work on your site as described, contact support from your dashboard and we will help — including a refund where the plugin cannot be made to work on a standard WooCommerce install.' },
];

function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="acc">
      {items.map((item, i) => (
        <div className="acc-item" key={item.q}>
          <button className="acc-btn" onClick={() => setOpen(open === i ? -1 : i)}>
            {item.q}<span>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <div className="acc-body">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

function DemoSlider() {
  const [index, setIndex] = useState(0);
  const max = PRODUCTS.length - 2;
  const next = () => setIndex(index >= max ? 0 : index + 1);
  const prev = () => setIndex(index <= 0 ? max : index - 1);
  useEffect(() => {
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  });
  return (
    <div className="demo">
      <div className="demo-head"><strong>Best Sellers</strong><span>Live demo — this is the slider</span></div>
      <div className="demo-view">
        <div className="demo-track" style={{ transform: `translateX(-${index * 50}%)` }}>
          {PRODUCTS.map((p) => (
            <div className="demo-card" key={p.name}>
              <img src={p.img} alt={p.name} />
              <h4>{p.name}</h4>
              <p>{p.cat}</p>
              <p className="price">{p.price}<s>{p.old}</s></p>
            </div>
          ))}
        </div>
      </div>
      <div className="demo-nav">
        <button className="arrow" onClick={prev} aria-label="Previous">‹</button>
        <div className="dots">
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button key={i} className={i === index ? 'dot on' : 'dot'} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
        <button className="arrow" onClick={next} aria-label="Next">›</button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <img src="/logo.svg" alt="Modern Product Slider logo" />
          </a>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#compare">Free vs Pro</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-actions">
            <a className="btn ghost small" href="#pricing">Log in</a>
            <a className="btn blue small" href="#pricing">Get Pro</a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">For WooCommerce stores</span>
              <h1>Beautiful product sliders that sell more.</h1>
              <p className="lead">Modern Product Slider turns your WooCommerce products into fast, responsive, great-looking sliders — in minutes, with no code. Start free, go Pro when you need unlimited sliders.</p>
              <div className="hero-ctas">
                <a className="btn blue" href="#pricing">Download Free</a>
                <a className="btn" href="#pricing">Get Pro — $3/mo</a>
              </div>
              <p className="hero-note"><b>Free on WordPress.org</b> · No credit card to start · Works with any theme</p>
              <ul className="checks">
                <li>Unlimited products per rack on Pro</li>
                <li>Responsive on mobile, tablet and desktop</li>
                <li>Shortcode, Gutenberg block and Elementor widget</li>
              </ul>
            </div>
            <DemoSlider />
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="container center">
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
              <div className="plan dark">
                <span className="badge">Best Value</span>
                <h3 style={{ marginTop: 12 }}>Unlimited Sites</h3>
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

        <section className="section soft">
          <div className="container split">
            <div>
              <span className="eyebrow">Modern Product Slider Pro</span>
              <h2>Level up your store with Pro</h2>
              <p className="lead">Power your store with the upgraded subscription that includes the Pro Add-On, unlimited sliders, and priority support — all in one place.</p>
              <ul className="checks">
                <li><b>Unify your workflow.</b> Create, style and publish sliders from one dashboard.</li>
                <li><b>No limits where it matters.</b> Unlimited sliders and unlimited products per rack.</li>
                <li><b>Simplify your spend.</b> One simple monthly plan, cancel anytime.</li>
              </ul>
              <div className="hero-ctas"><a className="btn blue" href="#pricing">See Pro plans</a></div>
            </div>
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=80" alt="A bright WooCommerce storefront" />
          </div>
        </section>

        <section className="section" id="features">
          <div className="container">
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

        <section className="section soft">
          <div className="container split">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&q=80" alt="A customer checking out on a phone" />
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

        <section className="section" id="compare">
          <div className="container">
            <div className="center">
              <span className="eyebrow">Free vs Pro</span>
              <h2>What do you get with Pro?</h2>
              <p className="lead">Free is great for trying it out. Pro removes the limits.</p>
            </div>
            <table className="compare">
              <thead><tr><th>Feature</th><th>Free</th><th>Pro — $3 or $10/mo</th></tr></thead>
              <tbody>
                <tr><td>Product sliders</td><td>Limited</td><td>Unlimited</td></tr>
                <tr><td>Products per rack</td><td>Limited</td><td>Unlimited</td></tr>
                <tr><td>Pro Add-On ZIP download</td><td>—</td><td>Instant</td></tr>
                <tr><td>Sites covered</td><td>1</td><td>1, or Unlimited on the $10 plan</td></tr>
                <tr><td>Support</td><td>Community</td><td>Priority developer support</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="section soft" id="how">
          <div className="container">
            <div className="center">
              <span className="eyebrow">How it works</span>
              <h2>Live on your store in three steps</h2>
            </div>
            <div className="steps">
              <div className="step"><b>Step 1</b><h3>Install Free</h3><p>Install Modern Product Slider from WordPress.org, or from Plugins → Add New in your dashboard.</p></div>
              <div className="step"><b>Step 2</b><h3>Create a slider</h3><p>Pick your products, choose a layout, and preview it live. No code, no settings maze.</p></div>
              <div className="step"><b>Step 3</b><h3>Publish &amp; go Pro</h3><p>Add it anywhere with a shortcode, block or widget. Upgrade to Pro for unlimited sliders and sites.</p></div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="center">
              <span className="eyebrow">Trusted by store owners</span>
              <h2>Stores that switched to Modern Product Slider</h2>
              <p className="lead">Placeholder quotes — replace these with real customer reviews before launch.</p>
            </div>
            <div className="grid3">
              <div className="card"><div className="stars">★★★★★</div><p className="quote">“Our best sellers finally look as good as they sell. Setup took ten minutes.”</p><p>— Store owner, WooCommerce fashion store</p></div>
              <div className="card"><div className="stars">★★★★★</div><p className="quote">“Unlimited sliders on the $10 plan paid for itself on our first agency client.”</p><p>— Agency owner, WordPress studio</p></div>
              <div className="card"><div className="stars">★★★★★</div><p className="quote">“Fast on mobile, clean on desktop, and customers actually swipe through it.”</p><p>— Store owner, WooCommerce electronics store</p></div>
            </div>
          </div>
        </section>

        <section className="section soft" id="faq">
          <div className="container faq">
            <div className="center">
              <span className="eyebrow">FAQ</span>
              <h2>Frequently asked questions</h2>
              <p className="lead">Have more questions? Contact support from your dashboard after signing up.</p>
            </div>
            <Accordion items={FAQS} />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta">
              <span className="eyebrow" style={{ color: '#38bdf8' }}>Build what’s next</span>
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
            <div><h4>Product</h4><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#compare">Free vs Pro</a><a href="#how">How it works</a></div>
            <div><h4>Resources</h4><a href="#faq">FAQ</a><a href="#pricing">Download Free</a><a href="#pricing">Get Pro</a></div>
            <div><h4>Company</h4><a href="#top">About</a><a href="#faq">Support</a><a href="#pricing">Log in</a></div>
          </div>
          <p className="copy">© 2026 Modern Product Slider. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
