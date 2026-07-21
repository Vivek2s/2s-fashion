import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Original theme reference',
  robots: { index: false, follow: false }, // reference-only route
};

/**
 * /homepage — archived copy of the untouched original theme (`/lasse/index.html`),
 * kept as the visual/motion reference. The live 2S Fashion version is at `/`
 * and serves `/lasse-test/index.html`.
 */
export default function OriginalThemeReference() {
  return (
    <main>
      <h1 className="sr-only">Original theme reference</h1>
      <iframe
        src="/lasse/index.html"
        title="Original theme reference"
        className="fixed inset-0 h-full w-full border-0"
      />
    </main>
  );
}
