'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

// Public web-app config for the 2S Fashion Firebase project. These values are
// safe to ship to the browser — access is controlled by Firebase Auth rules.
const firebaseConfig = {
  apiKey: 'AIzaSyAOidokKfw9RS99P1gn-7q_csA8qPE2DAU',
  authDomain: 'fir-fashion-9db31.firebaseapp.com',
  projectId: 'fir-fashion-9db31',
  storageBucket: 'fir-fashion-9db31.firebasestorage.app',
  messagingSenderId: '646583501988',
  appId: '1:646583501988:web:0c004c4f2d98939e9c9231',
  measurementId: 'G-GWEL40KF1E',
};

// Next.js may evaluate this module more than once — reuse the existing app.
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// OAuth web client auto-created by Firebase for this project. Used by Google
// Identity Services so Google sign-in works without third-party cookies
// (signInWithPopup's iframe relay is blocked in Safari/private/cookie-blocking
// browsers and hangs after the consent screen).
export const GOOGLE_WEB_CLIENT_ID =
  '646583501988-8j5raa55uuhclluu8k2e4hi11jsjnes4.apps.googleusercontent.com';
