import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — 2S Fashion',
  description: '2S Fashion — Noida studio address, store email and socials.',
};

/**
 * /contact — same original-engine treatment as the homepage: serves
 * `/lasse-test/contact.html` (address / contact / socials with the horizontal
 * image strip). Edit that file to change the details or photos.
 */
export default function ContactPage() {
  return (
    <main>
      <h1 className="sr-only">Contact 2S Fashion</h1>
      <iframe
        src="/lasse-test/contact.html"
        title="Contact 2S Fashion"
        className="fixed inset-0 h-full w-full border-0"
      />
    </main>
  );
}
