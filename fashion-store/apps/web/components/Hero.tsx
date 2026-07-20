export function Hero() {
  return (
    <section className="relative h-screen min-h-[560px] overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/media/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        {/* Sample campaign film — swap for your own footage in /public/media */}
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/25" aria-hidden />
      <div className="load-up absolute left-5 bottom-7 md:left-7 max-w-2xl text-white">
        <p className="text-xs uppercase tracking-[0.22em] opacity-85 mb-3">
          Autumn / Winter 2026
        </p>
        <h1 className="font-serif font-normal leading-[0.98] tracking-tight
          text-[clamp(40px,7vw,104px)]">
          Considered<br />by design.
        </h1>
        <a href="/shop"
          className="inline-block mt-6 text-xs uppercase tracking-[0.2em]
          border-b border-white/60 pb-1 transition-colors hover:border-white">
          Explore the collection
        </a>
      </div>
      <div className="absolute right-5 bottom-7 md:right-7 hidden sm:flex flex-col items-center gap-2
        text-white/90 text-[10px] uppercase tracking-[0.22em]">
        Scroll
        <span className="scroll-cue block h-9 w-px bg-white/60" aria-hidden />
      </div>
    </section>
  );
}
