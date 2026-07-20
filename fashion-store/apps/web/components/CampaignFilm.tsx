import { Reveal } from '@/components/Reveal';

export function CampaignFilm() {
  return (
    <section className="relative h-[70vh] min-h-[440px] overflow-hidden" aria-label="Campaign film">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/media/campaign-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        {/* Sample campaign film — swap for your own footage in /public/media */}
        <source src="/media/campaign.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20" aria-hidden />
      <Reveal className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-white
        flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] opacity-85 mb-2">
            The AW26 film
          </p>
          <h2 className="font-serif font-normal leading-[1] text-[clamp(26px,4vw,56px)]">
            Made to be worn,<br />not just seen.
          </h2>
        </div>
        <a href="/collections"
          className="text-xs uppercase tracking-[0.2em] border-b border-white/60 pb-1
          transition-colors hover:border-white">
          Discover the collection
        </a>
      </Reveal>
    </section>
  );
}
