import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Download,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';
import Loader from './Loader.jsx';

export default function PaymentStatusView({
  type = 'success', // 'success' | 'cancel'
  user,
  onPaymentVerified,
  onGoToDashboard,
  onGoToLanding,
  onRetryCheckout,
  isDark = true,
}) {
  const [verifying, setVerifying] = useState(type === 'success');
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract orderId and beacon (tracker) from URL hash or query params
  const getUrlParams = () => {
    try {
      let rawQuery = '';
      if (typeof window !== 'undefined') {
        if (window.location.hash.includes('?')) {
          rawQuery = window.location.hash.split('?')[1];
        } else if (window.location.search) {
          rawQuery = window.location.search.replace(/^\?/, '');
        }
      }
      const params = new URLSearchParams(rawQuery);
      return {
        orderId: params.get('order_id') || params.get('orderId') || '',
        trackerToken: params.get('beacon') || params.get('tracker') || params.get('tracker_token') || '',
      };
    } catch {
      return { orderId: '', trackerToken: '' };
    }
  };

  const { orderId, trackerToken } = getUrlParams();

  // Perform server-side payment verification
  useEffect(() => {
    if (type !== 'success') return;

    let isMounted = true;
    const verifyPayment = async () => {
      setVerifying(true);
      setError('');
      try {
        const res = await fetch('/api/v1/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, trackerToken }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (res.ok && data.verified) {
          setVerificationResult(data);
          if (data.user && onPaymentVerified) {
            onPaymentVerified(data.user);
          }
        } else {
          setError(data.reason || data.error || 'Server could not verify payment with Safepay.');
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Network error while verifying payment status with server.');
      } finally {
        if (isMounted) setVerifying(false);
      }
    };

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [type, orderId, trackerToken]);

  const handleCopyKey = (key) => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#060E1D] text-slate-100' : 'bg-[#F3F6FA] text-slate-900'
      }`}
    >
      {/* Header */}
      <header
        className={`border-b py-4 px-6 sm:px-8 max-w-6xl w-full mx-auto flex items-center justify-between ${
          isDark ? 'border-[#122449]' : 'border-slate-200'
        }`}
      >
        <button onClick={onGoToLanding} className="focus:outline-none flex items-center">
          <BrandLogo className="h-8" isDark={isDark} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Safepay Secure Checkout
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL
          </span>
        </div>
      </header>

      {/* Main Status Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl w-full mx-auto my-8">
        {verifying ? (
          <div className="w-full text-center space-y-4">
            <Loader message="Verifying payment with Safepay server..." isDark={isDark} />
            <p className="text-xs text-slate-400">
              Performing cryptographic server-to-server validation. Please do not close this window.
            </p>
          </div>
        ) : type === 'success' && !error ? (
          /* SUCCESS VIEW */
          <div
            className={`w-full rounded-3xl border p-8 space-y-6 shadow-2xl transition-all ${
              isDark ? 'bg-[#0B152B] border-[#162D5D]' : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
            {/* Success Icon & Heading */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                Payment Verified by Safepay
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome to Pro Edition!
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Your payment was successfully processed. Your Pro license key has been generated and activated.
              </p>
            </div>

            {/* Generated Pro License Key Box */}
            {verificationResult?.licenseKey && (
              <div
                className={`p-5 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-[#071126] border-[#14284F]' : 'bg-sky-50/70 border-sky-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" /> Your Pro License Key
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active &bull; Instant Delivery
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl border font-mono text-xs flex items-center justify-between ${
                    isDark ? 'bg-[#050D1A] border-[#102244] text-sky-300' : 'bg-white border-slate-300 text-sky-900'
                  }`}
                >
                  <span className="truncate font-black">{verificationResult.licenseKey}</span>
                  <button
                    onClick={() => handleCopyKey(verificationResult.licenseKey)}
                    className="ml-3 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Key
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-slate-400">
                  Paste this key in your WordPress dashboard under <strong>Modern Slider &rarr; Pro Activation</strong>.
                </p>
              </div>
            )}

            {/* Receipt Summary Details */}
            <div
              className={`p-4 rounded-2xl border space-y-2 text-xs font-mono ${
                isDark ? 'bg-[#050D1A] border-[#14284F] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex justify-between border-b border-slate-700/30 pb-1.5">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-bold text-white truncate max-w-[200px]">
                  {verificationResult?.order?.id || orderId || 'Verified'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-700/30 pb-1.5">
                <span className="text-slate-400">Gateway Reference:</span>
                <span className="font-bold text-sky-400 truncate max-w-[200px]">
                  {verificationResult?.order?.gatewayTransactionId || trackerToken || 'Safepay TXN'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-700/30 pb-1.5">
                <span className="text-slate-400">Plan Activated:</span>
                <span className="font-bold text-emerald-400">
                  {verificationResult?.order?.planName || 'Modern Product Slider Pro'}
                </span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-black text-white">
                  {verificationResult?.order?.currency || 'PKR'} {verificationResult?.order?.amount?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onGoToDashboard}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white font-black text-xs shadow-lg border border-[#2555A8] transition active:scale-95 flex items-center justify-center gap-2"
              >
                Open License Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onGoToLanding}
                className={`py-3 px-5 rounded-2xl text-xs font-bold border transition ${
                  isDark
                    ? 'border-slate-700 bg-[#071126] text-slate-300 hover:text-white'
                    : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                Back to Website
              </button>
            </div>
          </div>
        ) : (
          /* CANCELLATION OR FAILURE VIEW */
          <div
            className={`w-full rounded-3xl border p-8 space-y-6 shadow-2xl transition-all ${
              isDark ? 'bg-[#0B152B] border-[#162D5D]' : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-9 h-9" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 block">
                {type === 'cancel' ? 'Payment Cancelled' : 'Payment Verification Incomplete'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {type === 'cancel' ? 'Checkout Aborted' : 'Verification Issue'}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {error ||
                  (type === 'cancel'
                    ? 'Your payment session was cancelled. No charges or card debits were made.'
                    : 'We could not confirm the payment status with Safepay. If funds were debited, your order will automatically be activated via webhook.')}
              </p>
            </div>

            {orderId && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-mono text-center ${
                  isDark ? 'bg-[#050D1A] border-[#14284F] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Order Reference: <strong className="text-sky-400">{orderId}</strong>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onRetryCheckout}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#0C1E3D] to-[#1E488F] hover:from-[#102750] hover:to-[#2458AD] text-white font-black text-xs shadow-lg border border-[#2555A8] transition active:scale-95 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try Again with Safepay
              </button>
              <button
                onClick={onGoToLanding}
                className={`py-3 px-5 rounded-2xl text-xs font-bold border transition ${
                  isDark
                    ? 'border-slate-700 bg-[#071126] text-slate-300 hover:text-white'
                    : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 px-6 text-center text-xs ${
          isDark ? 'border-[#122449] text-slate-500' : 'border-slate-200 text-slate-500'
        }`}
      >
        &copy; 2026 Modern Product Slider SaaS &bull; Powered by Safepay Online Payments
      </footer>
    </div>
  );
}
