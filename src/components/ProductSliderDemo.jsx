import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Eye,
  Check,
  RotateCw,
  Sliders,
  Sparkles,
  X,
  Star,
  ExternalLink,
} from 'lucide-react';

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    title: 'Cyberpunk Oversized Hoodie',
    category: 'Outerwear',
    price: '$89.00',
    oldPrice: '$110.00',
    tag: 'Bestseller',
    frontImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80',
    backImage: 'https://images.unsplash.com/photo-1578768079052-aa76e520028b?auto=format&fit=crop&w=700&q=80',
    colors: ['#0B132B', '#00A3FF', '#475569'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviews: 142,
    stock: 'In Stock (14 left)',
    sku: 'MPS-CYBER-01',
  },
  {
    id: 2,
    title: 'Kinetic Heavyweight Fleece',
    category: 'Sweatshirts',
    price: '$74.00',
    oldPrice: '$92.00',
    tag: 'Staff Pick',
    frontImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&q=80',
    backImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
    colors: ['#1E293B', '#38BDF8', '#E2E8F0'],
    sizes: ['M', 'L', 'XL'],
    rating: 4.8,
    reviews: 98,
    stock: 'In Stock (8 left)',
    sku: 'MPS-KINETIC-02',
  },
  {
    id: 3,
    title: 'Atelier Technical Parka',
    category: 'Jackets',
    price: '$149.00',
    oldPrice: '$185.00',
    tag: 'Limited 3D',
    frontImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=700&q=80',
    backImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    colors: ['#0F172A', '#0284C7', '#64748B'],
    sizes: ['S', 'M', 'L'],
    rating: 5.0,
    reviews: 64,
    stock: 'In Stock (5 left)',
    sku: 'MPS-ATELIER-03',
  },
  {
    id: 4,
    title: 'Minimalist Modular Cargo',
    category: 'Pants',
    price: '$68.00',
    oldPrice: '$85.00',
    tag: 'New Drop',
    frontImage: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=700&q=80',
    backImage: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700&q=80',
    colors: ['#0B132B', '#334155'],
    sizes: ['30', '32', '34', '36'],
    rating: 4.7,
    reviews: 51,
    stock: 'In Stock (19 left)',
    sku: 'MPS-CARGO-04',
  },
  {
    id: 5,
    title: 'Aero Reflective Windbreaker',
    category: 'Sportswear',
    price: '$112.00',
    oldPrice: '$139.00',
    tag: 'Waterproof',
    frontImage: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=80',
    backImage: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=700&q=80',
    colors: ['#0284C7', '#0F172A', '#F1F5F9'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviews: 110,
    stock: 'In Stock (12 left)',
    sku: 'MPS-AERO-05',
  },
];

export default function ProductSliderDemo({ isDark = true }) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [hoveredId, setHoveredId] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalSide, setModalSide] = useState('front'); // front | back
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(0);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rackAngle, setRackAngle] = useState(38); // degrees

  // Auto rotation effect
  useEffect(() => {
    if (!autoRotate || hoveredId !== null || modalProduct !== null) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SAMPLE_PRODUCTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoRotate, hoveredId, modalProduct]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SAMPLE_PRODUCTS.length) % SAMPLE_PRODUCTS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SAMPLE_PRODUCTS.length);
  };

  const handleOpenModal = (product) => {
    setModalProduct(product);
    setModalSide('front');
    setSelectedSize(product.sizes[0] || 'M');
    setSelectedColor(0);
    setCartSuccess(false);
  };

  const handleAddToCart = () => {
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2400);
  };

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border transition-all duration-300">
      <div
        className={`relative p-6 sm:p-10 ${
          isDark
            ? 'bg-gradient-to-b from-slate-900 via-[#0B132B] to-[#0A0F1E] border-slate-800 text-slate-100'
            : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Interactive Showcase Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Live WooCommerce Preview
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Interactive 3D Showroom Rack
            </h3>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Hover on garments to rotate into front-view, swing the price tags, or click for 360° AJAX Quick-View.
            </p>
          </div>

          {/* Interactive Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1.5 transition border ${
                autoRotate
                  ? isDark
                    ? 'bg-sky-500/15 border-sky-500/40 text-sky-400'
                    : 'bg-sky-50 border-sky-300 text-sky-700'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              Auto-Rotate: {autoRotate ? 'ON' : 'PAUSED'}
            </button>
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Rack Angle:</span>
              <input
                type="range"
                min="20"
                max="55"
                value={rackAngle}
                onChange={(e) => setRackAngle(Number(e.target.value))}
                className="w-16 accent-sky-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-sky-500">{rackAngle}°</span>
            </div>
          </div>
        </div>

        {/* 3D Clothing Rack Visual Stage */}
        <div className="relative py-12 px-4 sm:px-12 flex items-center justify-center min-h-[460px] perspective-[1200px]">
          {/* Subtle Ceiling Rod / Rack Wire */}
          <div
            className={`absolute top-10 left-8 right-8 h-1 rounded-full shadow-sm z-0 ${
              isDark ? 'bg-slate-800' : 'bg-slate-300'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            aria-label="Previous product"
            className={`absolute left-2 sm:left-4 z-20 p-3 rounded-2xl border shadow-lg transition-transform active:scale-95 ${
              isDark
                ? 'bg-slate-900/90 border-slate-700/80 text-white hover:bg-slate-800 hover:border-sky-500/50'
                : 'bg-white/95 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-sky-400 shadow-slate-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next product"
            className={`absolute right-2 sm:right-4 z-20 p-3 rounded-2xl border shadow-lg transition-transform active:scale-95 ${
              isDark
                ? 'bg-slate-900/90 border-slate-700/80 text-white hover:bg-slate-800 hover:border-sky-500/50'
                : 'bg-white/95 border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-sky-400 shadow-slate-200'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Stage Cards */}
          <div className="relative w-full max-w-3xl h-[380px] flex items-center justify-center">
            {SAMPLE_PRODUCTS.map((prod, idx) => {
              const offset = idx - activeIndex;
              const isActive = offset === 0;
              const isHovered = hoveredId === prod.id;

              // Compute 3D transforms based on distance from center active card
              let translateX = offset * 180; // card spacing
              let translateZ = -Math.abs(offset) * 120;
              let rotateY = offset === 0 ? 0 : offset < 0 ? rackAngle : -rackAngle;
              let scale = isActive ? 1 : 0.88 - Math.abs(offset) * 0.08;
              let opacity = Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.22;
              let zIndex = 10 - Math.abs(offset);

              // Smooth hover rotation to front
              if (isHovered) {
                rotateY = 0;
                translateZ += 60;
                scale = Math.max(scale, 1.02);
              }

              return (
                <div
                  key={prod.id}
                  onMouseEnter={() => setHoveredId(prod.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => {
                    if (!isActive) setActiveIndex(idx);
                  }}
                  style={{
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className={`absolute w-64 sm:w-72 rounded-2xl border cursor-pointer select-none overflow-hidden ${
                    isDark
                      ? isActive
                        ? 'bg-[#15203B] border-sky-500/60 shadow-2xl shadow-sky-500/20'
                        : 'bg-slate-900/90 border-slate-800 shadow-lg'
                      : isActive
                      ? 'bg-white border-sky-400 shadow-2xl shadow-sky-500/15 ring-2 ring-sky-400/20'
                      : 'bg-white border-slate-200/90 shadow-md'
                  }`}
                >
                  {/* Realistic Metallic Hanger Top Hook */}
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-8 h-3 border-t-2 border-l-2 border-slate-400/80 rounded-tl-full" />
                  </div>

                  {/* Product Visual Container */}
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-950/20">
                    <img
                      src={prod.frontImage}
                      alt={prod.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                      loading="lazy"
                    />

                    {/* Swinging Physical Price Tag */}
                    <div className="absolute top-3 left-3 origin-top animate-[swing_3s_ease-in-out_infinite]">
                      <div className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-slate-900 border border-slate-300 shadow-md text-[11px] font-extrabold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        {prod.price}
                      </div>
                    </div>

                    {/* Badge */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-sm border border-white/10">
                      {prod.tag}
                    </span>

                    {/* Quick View Button Hover Trigger */}
                    <div
                      className={`absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center gap-2 transition-opacity duration-200 ${
                        isHovered || isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(prod);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-xl hover:bg-sky-50 transition active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-500" /> Quick View
                      </button>
                    </div>
                  </div>

                  {/* Product Details Bar */}
                  <div className="p-4">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        {prod.category}
                      </span>
                      <span className="text-emerald-500 font-semibold">{prod.stock}</span>
                    </div>
                    <h4 className="font-bold text-sm truncate tracking-tight mb-2">
                      {prod.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-sky-500">{prod.price}</span>
                        <span className={`text-xs line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {prod.oldPrice}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(prod);
                        }}
                        className={`p-2 rounded-lg border transition ${
                          isDark
                            ? 'bg-slate-800 hover:bg-sky-500 hover:text-slate-950 border-slate-700'
                            : 'bg-slate-100 hover:bg-sky-500 hover:text-white border-slate-200'
                        }`}
                        title="Add to cart preview"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots (Matching Official Brand Logo) */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {SAMPLE_PRODUCTS.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setActiveIndex(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                dotIdx === activeIndex
                  ? 'w-8 bg-sky-500 shadow-md shadow-sky-500/40'
                  : isDark
                  ? 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  : 'w-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* QUICK VIEW MODAL (360° Front/Back AJAX Simulation) */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`relative max-w-2xl w-full rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Close */}
            <button
              onClick={() => setModalProduct(null)}
              className={`absolute top-4 right-4 z-10 p-2 rounded-full border transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-black'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Product Visual with Front/Back Flip */}
              <div className="relative h-72 md:h-full bg-slate-950/20 p-6 flex flex-col items-center justify-center">
                <img
                  src={modalSide === 'front' ? modalProduct.frontImage : modalProduct.backImage}
                  alt={modalProduct.title}
                  className="w-full h-64 object-cover rounded-2xl shadow-lg transition-all duration-500"
                />

                {/* 360 Front/Back Toggle Switch */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setModalSide('front')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                      modalSide === 'front'
                        ? 'bg-sky-500 text-white border-sky-400'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Front View
                  </button>
                  <button
                    onClick={() => setModalSide('back')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                      modalSide === 'back'
                        ? 'bg-sky-500 text-white border-sky-400'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Back View
                  </button>
                </div>
              </div>

              {/* Product Options & AJAX Add to Cart */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{modalProduct.rating}</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      ({modalProduct.reviews} customer reviews)
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight">{modalProduct.title}</h3>
                  <div className="flex items-baseline gap-2 mt-1 mb-4">
                    <span className="text-2xl font-black text-sky-500">{modalProduct.price}</span>
                    <span className={`text-sm line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {modalProduct.oldPrice}
                    </span>
                  </div>

                  {/* Size Selection */}
                  <div className="mb-4">
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Select Garment Size
                    </label>
                    <div className="flex gap-2">
                      {modalProduct.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold border transition ${
                            selectedSize === s
                              ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                              : isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                              : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="mb-4">
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Color Variant
                    </label>
                    <div className="flex gap-2">
                      {modalProduct.colors.map((colorHex, cIdx) => (
                        <button
                          key={colorHex}
                          onClick={() => setSelectedColor(cIdx)}
                          style={{ backgroundColor: colorHex }}
                          className={`w-7 h-7 rounded-full border-2 transition ${
                            selectedColor === cIdx
                              ? 'ring-2 ring-sky-500 ring-offset-2 border-white'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* AJAX Add to Cart Action */}
                <div>
                  <button
                    onClick={handleAddToCart}
                    disabled={cartSuccess}
                    className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
                      cartSuccess
                        ? 'bg-emerald-500 text-white'
                        : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/25'
                    }`}
                  >
                    {cartSuccess ? (
                      <>
                        <Check className="w-4 h-4" /> Added to WooCommerce Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Instant AJAX Add to Cart
                      </>
                    )}
                  </button>
                  <p className={`text-[11px] text-center mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Real-time WooCommerce cart fragment refresh supported.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

