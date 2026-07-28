'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { firebaseAuth, googleProvider, appleProvider, GOOGLE_WEB_CLIENT_ID } from '@/lib/firebase';

type Step = 'providers' | 'email' | 'otp';

/** Minimal typings for the Google Identity Services script. */
interface GisId {
  initialize(config: {
    client_id: string;
    callback: (resp: { credential: string }) => void;
    use_fedcm_for_prompt?: boolean;
  }): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
}
declare global {
  interface Window {
    google?: { accounts?: { id?: GisId } };
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';

/** Load the GIS script once; resolves false if it can't load (blocked/offline). */
function loadGis(): Promise<boolean> {
  if (window.google?.accounts?.id) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    const script = existing ?? document.createElement('script');
    const done = () => resolve(Boolean(window.google?.accounts?.id));
    script.addEventListener('load', done);
    script.addEventListener('error', () => resolve(false));
    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      document.head.appendChild(script);
    } else if (window.google?.accounts?.id) {
      done();
    }
  });
}

/** Reject after `ms` so a sign-in that never reports back can't hang the UI. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('sign-in timed out')), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

/** Normalise an Indian mobile entry to E.164 (+91XXXXXXXXXX by default). */
function toE164(input: string): string {
  const raw = input.replace(/[\s-]/g, '');
  return raw.startsWith('+') ? raw : `+91${raw}`;
}

function errorCode(err: unknown): string {
  return err instanceof Error && 'code' in err ? String((err as { code?: string }).code) : '';
}

function friendlyError(err: unknown): string {
  switch (errorCode(err)) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email via a different sign-in method.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-phone-number':
      return 'That phone number looks invalid. Use format +91 98765 43210.';
    case 'auth/invalid-verification-code':
      return 'Incorrect OTP. Please check and try again.';
    case 'auth/code-expired':
      return 'This OTP has expired. Please request a new one.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled yet. Please try another option.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (user: User) => void;
}) {
  const [step, setStep] = useState<Step>('providers');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recaptchaHost = useRef<HTMLDivElement>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const gisHost = useRef<HTMLDivElement>(null);
  // null = GIS still loading, true = GIS button rendered, false = fall back to popup
  const [gisReady, setGisReady] = useState<boolean | null>(null);

  useEffect(() => {
    return () => {
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    };
  }, []);

  // Google via Identity Services: GIS hands us an ID token first-party, which
  // we exchange with signInWithCredential. Unlike signInWithPopup, this does
  // not depend on third-party cookies, so it also works in Safari/private
  // windows where the popup flow hangs after the consent screen.
  const onGisCredential = useCallback(
    async (resp: { credential: string }) => {
      setError(null);
      setBusy('google');
      try {
        const credential = GoogleAuthProvider.credential(resp.credential);
        const result = await signInWithCredential(firebaseAuth, credential);
        onSuccess(result.user);
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setBusy(null);
      }
    },
    [onSuccess]
  );

  useEffect(() => {
    let cancelled = false;
    void loadGis().then((ok) => {
      if (cancelled) return;
      const gis = window.google?.accounts?.id;
      if (!ok || !gis || !gisHost.current) {
        setGisReady(false);
        return;
      }
      try {
        gis.initialize({
          client_id: GOOGLE_WEB_CLIENT_ID,
          callback: (resp) => void onGisCredential(resp),
          use_fedcm_for_prompt: true,
        });
        gis.renderButton(gisHost.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
          width: 380,
        });
        setGisReady(true);
      } catch {
        setGisReady(false);
      }
    });
    return () => { cancelled = true; };
  }, [onGisCredential]);

  async function signInWithProvider(kind: 'google' | 'apple') {
    setError(null);
    setBusy(kind);
    try {
      const provider = kind === 'google' ? googleProvider : appleProvider;
      // Watchdog: if the popup result never comes back (e.g. third-party
      // cookies blocked), fail with guidance instead of spinning forever.
      const result = await withTimeout(signInWithPopup(firebaseAuth, provider), 75000);
      onSuccess(result.user);
    } catch (err) {
      if (err instanceof Error && err.message === 'sign-in timed out') {
        setError('Sign-in did not complete. Please allow popups and third-party cookies for this site, or use email / mobile OTP instead.');
      } else {
        setError(friendlyError(err));
      }
    } finally {
      setBusy(null);
    }
  }

  // Register-or-sign-in: try to create the account; if the email is already
  // registered, fall back to a normal sign-in with the same credentials.
  async function continueWithEmail() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    setError(null);
    setBusy('email');
    try {
      try {
        const result = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        onSuccess(result.user);
      } catch (err) {
        if (errorCode(err) === 'auth/email-already-in-use') {
          const result = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
          onSuccess(result.user);
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(null);
    }
  }

  async function sendOtp() {
    if (!/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
      setError('Please enter a valid mobile number.');
      return;
    }
    setError(null);
    setBusy('phone');
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, recaptchaHost.current!, {
          size: 'invisible',
        });
      }
      confirmationRef.current = await signInWithPhoneNumber(
        firebaseAuth,
        toE164(phone.trim()),
        recaptchaRef.current
      );
      setStep('otp');
    } catch (err) {
      // A used reCAPTCHA widget can't be reused — drop it so retry gets a fresh one.
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
      setError(friendlyError(err));
    } finally {
      setBusy(null);
    }
  }

  async function verifyOtp() {
    if (!confirmationRef.current) return;
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit OTP sent to your phone.');
      return;
    }
    setError(null);
    setBusy('otp');
    try {
      const result = await confirmationRef.current.confirm(otp.trim());
      onSuccess(result.user);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(null);
    }
  }

  const inputClass =
    'h-12 w-full border border-line bg-white px-4 text-sm tracking-wide outline-none transition-colors focus:border-ink';
  const primaryBtn =
    'h-12 w-full bg-ink text-[11px] uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-90 disabled:opacity-40';
  const providerBtn =
    'flex h-12 w-full items-center justify-center gap-3 border border-line text-[11px] uppercase tracking-[0.22em] transition-colors hover:border-ink disabled:opacity-40';
  const backLink =
    'w-full py-2 text-[11px] uppercase tracking-[0.18em] text-muted underline underline-offset-4 hover:text-ink';

  const subtitle =
    step === 'providers' ? 'Sign in to continue'
    : step === 'email' ? 'Continue with your email'
    : 'Enter the OTP we sent you';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to get in touch"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl">Get in touch</h2>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in"
            className="-mr-1 -mt-1 p-2 text-xl leading-none transition-opacity hover:opacity-60"
          >
            ×
          </button>
        </div>

        {step === 'providers' && (
          <div className="space-y-3">
            {/* Google — GIS-rendered button (first-party credential flow). */}
            <div
              ref={gisHost}
              className={`flex h-12 items-center justify-center ${gisReady ? '' : 'hidden'}`}
              aria-label="Continue with Google"
            />
            {busy === 'google' && (
              <p className="text-center text-[11px] uppercase tracking-[0.18em] text-muted">Signing in…</p>
            )}
            {gisReady === false && (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => signInWithProvider('google')}
                className={providerBtn}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.8 2.9c2.3-2.1 3.6-5.1 3.6-8.6z" />
                  <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-3.9 3C3.3 21.3 7.3 24 12 24z" />
                  <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4l-4-3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.9-3z" />
                  <path fill="#EA4335" d="M12 4.7c2.2 0 3.7 1 4.6 1.8l3.4-3.3C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l4 3c.9-2.8 3.6-4.9 6.7-4.9z" />
                </svg>
                {busy === 'google' ? 'Signing in…' : 'Continue with Google'}
              </button>
            )}

            <button
              type="button"
              disabled={busy !== null}
              onClick={() => signInWithProvider('apple')}
              className={providerBtn}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M16.7 12.9c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.9-1.6 0-3.1 1-4 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.7zM14.3 5.6c.7-.8 1.1-1.9 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" />
              </svg>
              {busy === 'apple' ? 'Signing in…' : 'Continue with Apple'}
            </button>

            <button
              type="button"
              disabled={busy !== null}
              onClick={() => { setStep('email'); setError(null); }}
              className={providerBtn}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
                <path d="m3 6.5 9 6.5 9-6.5" />
              </svg>
              Continue with Email
            </button>

            <div className="flex items-center gap-4 py-2">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[11px] uppercase tracking-[0.18em] text-muted">or</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted" htmlFor="auth-phone">
              Mobile number
            </label>
            <input
              id="auth-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') void sendOtp(); }}
              className={inputClass}
            />
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void sendOtp()}
              className={primaryBtn}
            >
              {busy === 'phone' ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-3">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              className={inputClass}
            />
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') void continueWithEmail(); }}
              className={inputClass}
            />
            <p className="text-[12px] leading-relaxed text-muted">
              New here? We&apos;ll create your account automatically.
            </p>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void continueWithEmail()}
              className={primaryBtn}
            >
              {busy === 'email' ? 'Signing in…' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('providers'); setPassword(''); setError(null); }}
              className={backLink}
            >
              Back to all options
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              OTP sent to <span className="text-ink">{toE164(phone.trim())}</span>
            </p>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted" htmlFor="auth-otp">
              One-time password
            </label>
            <input
              id="auth-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') void verifyOtp(); }}
              className={`${inputClass} tracking-[0.4em]`}
            />
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void verifyOtp()}
              className={primaryBtn}
            >
              {busy === 'otp' ? 'Verifying…' : 'Verify & continue'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('providers'); setOtp(''); setError(null); }}
              className={backLink}
            >
              Change number
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-[12px] text-red-600" role="alert">{error}</p>
        )}

        {/* Invisible reCAPTCHA host for Firebase phone auth */}
        <div ref={recaptchaHost} />
      </div>
    </div>
  );
}
