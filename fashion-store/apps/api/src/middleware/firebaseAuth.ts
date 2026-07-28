import type { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// Verifies Firebase ID tokens against Google's public JWKS — no service-account
// key needed. Tokens are RS256 JWTs issued by securetoken.google.com.
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? 'fir-fashion-9db31';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

/** Claims we read off a verified Firebase ID token. */
export interface FirebaseUser {
  uid: string;
  email?: string;
  phone?: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    firebaseUser?: FirebaseUser;
  }
}

export async function requireFirebaseAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing Authorization bearer token' });

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    if (!payload.sub) throw new Error('token has no subject');

    const firebase = payload.firebase as { sign_in_provider?: string } | undefined;
    req.firebaseUser = {
      uid: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      phone: typeof payload.phone_number === 'string' ? payload.phone_number : undefined,
      displayName: typeof payload.name === 'string' ? payload.name : undefined,
      photoURL: typeof payload.picture === 'string' ? payload.picture : undefined,
      provider: firebase?.sign_in_provider,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
