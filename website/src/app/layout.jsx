import './globals.css';

export const metadata = {
  title: 'Modern Product Slider — Beautiful WooCommerce Product Sliders',
  description:
    'Create beautiful, fast, responsive WooCommerce product sliders in minutes. Free on WordPress.org. Pro from $3/month — unlimited sliders, unlimited products per rack, priority support.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
