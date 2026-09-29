import mixpanel from 'mixpanel-browser';

// Ships in the client bundle either way, so it is not a secret. Overridable so
// dev/staging can point at a separate project instead of production reporting.
const MIXPANEL_TOKEN =
  process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? 'ff711266d5d7f1b850ff7b94a28f922b';

let initialised = false;

/** Lazily init on first use — the token is only needed once we actually track. */
function ready(): boolean {
  if (!initialised) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: false,
      persistence: 'localStorage',
      ignore_dnt: true,
    });
    initialised = true;
  }
  return true;
}

/** A page view, reported with the route it happened on. */
export function trackPageView(page: string, props?: Record<string, unknown>): void {
  const payload = { page, ...props };
  if (ready()) mixpanel.track('Page View', payload);
}

/**
 * A CTA click. Uses sendBeacon so the event survives the navigation that
 * usually follows it (e.g. opening WhatsApp in a new tab).
 */
export function track(cta: string, props?: Record<string, unknown>): void {
  if (ready()) {
    mixpanel.track(
      'CTA Click',
      { cta, page: window.location.pathname, ...props },
      { transport: 'sendBeacon' },
    );
  }
}
