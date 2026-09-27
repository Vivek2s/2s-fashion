// Meta Pixel. The ID is not a secret (it ships in the client bundle either way),
// so it defaults to the live pixel and can be overridden per environment to keep
// staging traffic out of the production dataset.
export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? '1006654455725122';

type FbqFn = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

/** Re-fire PageView after a client-side navigation. */
export function pageview(): void {
  window.fbq?.('track', 'PageView');
}

/** Standard Meta event, e.g. track('AddToCart', { value: 4200, currency: 'INR' }). */
export function track(event: string, params?: Record<string, unknown>): void {
  window.fbq?.('track', event, params);
}
