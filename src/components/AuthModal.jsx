import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'signup',
  selectedPlan,
  onSuccess,
  isDark = true,
}) {
  const [mode, setMode] = useState(initialMode); // login | signup
  const [step, setStep] = useState('email'); // email | otp
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [emailDelivered, setEmailDelivered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleBtnRef = useRef(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    setMode(initialMode);
    setStep('email');
    setError('');
    setOtp(['', '', '', '', '', '']);
    setPreviewCode('');
  }, [initialMode, isOpen]);

  // Real Google Identity Services initialization
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (isOpen && clientId && window.google?.accounts?.id && googleBtnRef.current) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setLoading(true);
          try {
            const res = await fetch('/api/v1/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            });
            const data = await res.json();
            if (data.success) {
              onSuccess(data.user);
            } else {
              setError(data.error || 'Google sign-in failed.');
            }
          } finally {
            setLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: isDark ? 'filled_black' : 'outline',
        size: 'large',
        width: 360,
        text: 'continue_with',
      });
    }
  }, [isOpen, onSuccess, isDark]);

  if (!isOpen) return null;

  const handleSimulatedGoogleSignIn = async () => {
    const gmail =
      email.trim() ||
      window.prompt('Enter your Google / Gmail address to continue:', 'alex.store@gmail.com');
    if (!gmail) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: gmail,
          name: name.trim() || gmail.split('@')[0].replace(/[._]/g, ' '),
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.user);
      } else {
        setError(data.error || 'Could not sign in with Google.');
      }
    } catch {
      setError('Network error while connecting to Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send verification code.');
        return;
      }
      setEmailDelivered(Boolean(data.emailDelivered));
      setOtpToken(data.otpToken || '');
      setPreviewCode(data.previewCode || '');
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch {
      setError('Network error sending code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Enter the full 6-digit verification code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, name, otpToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid verification code.');
        return;
      }
      onSuccess(data.user);
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasRealGoogleClient = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`rounded-3xl max-w-md w-full p-8 relative shadow-2xl border transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className={`absolute top-5 right-5 p-2 rounded-xl border transition ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-black'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Header */}
        <div className="mb-6">
          <div className="mb-3">
            <BrandLogo className="h-8" isDark={isDark} showSubtitle={false} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {step === 'otp'
              ? 'Enter Verification Code'
              : mode === 'signup'
              ? 'Create Your Pro Account'
              : 'Sign in to Your Account'}
          </h2>
          {selectedPlan && (
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Proceeding with{' '}
              <strong className="text-sky-500">
                {selectedPlan === 'single' ? 'Single Site Plan ($3/mo)' : 'Unlimited Sites Plan ($10/mo)'}
              </strong>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-medium">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <div className="space-y-4">
            {/* Google OAuth Button */}
            {hasRealGoogleClient ? (
              <div ref={googleBtnRef} className="flex justify-center" />
            ) : (
              <button
                type="button"
                onClick={handleSimulatedGoogleSignIn}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition border shadow-sm ${
                  isDark
                    ? 'bg-white hover:bg-slate-100 text-slate-900 border-white'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                Continue with Google
              </button>
            )}

            <div className="relative flex items-center py-1">
              <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
              <span
                className={`shrink mx-3 text-[11px] uppercase tracking-wider font-bold ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                or email verification
              </span>
              <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            </div>

            {/* Email OTP Request Form */}
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Gmail / Email Address
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 absolute left-3.5 top-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@store.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition active:scale-98"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send 6-Digit Code <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                className="text-sky-500 hover:underline font-semibold"
              >
                {mode === 'signup' ? 'Already have an account? Sign in' : 'New user? Create an account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@modernproductslider.com');
                  setMode('login');
                }}
                className={`text-[11px] hover:underline ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Admin Quick-Fill
              </button>
            </div>
          </div>
        ) : (
          /* OTP Entry Step */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              We sent a 6-digit verification code to <strong className="text-sky-500">{email}</strong>.
            </p>

            {previewCode && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-sky-500/10 border-sky-500/30' : 'bg-sky-50 border-sky-200'
                }`}
              >
                <span className={`text-xs ${isDark ? 'text-sky-300' : 'text-sky-800'}`}>
                  Live Preview Code:
                </span>
                <button
                  type="button"
                  onClick={() => setOtp(previewCode.split(''))}
                  className="font-mono font-black text-xs bg-sky-500 text-white px-2.5 py-1 rounded-lg hover:bg-sky-400 transition"
                >
                  {previewCode} (Auto-Fill)
                </button>
              </div>
            )}

            <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className={`w-11 sm:w-12 h-14 text-center text-xl font-black font-mono rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition active:scale-98"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Verify Code &amp; Continue
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep('email')}
                className={`inline-flex items-center gap-1 font-medium hover:underline ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-sky-500 hover:underline font-semibold"
              >
                Resend code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
