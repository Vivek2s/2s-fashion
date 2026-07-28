import type { Metadata } from 'next';
import { StudioGenerator } from '@/components/StudioGenerator';

/**
 * Local-only image generation studio. Generates on-model / standalone product
 * imagery for the home, collection and product pages via the OpenAI image API
 * and saves results to the repo-root `generated/` folder. Never index this.
 */
export const metadata: Metadata = {
  title: 'Studio — Image Generator',
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <header className="mx-auto max-w-5xl px-6 pb-10 pt-16">
        <h1 className="font-serif text-3xl">Studio</h1>
        <p className="mt-2 max-w-xl text-sm text-neutral-500">
          Generate on-model and standalone product imagery for the home, collection and product
          pages. Results are saved locally to <code>generated/</code> at the repo root.
        </p>
      </header>
      <StudioGenerator />
    </main>
  );
}
