import Link from 'next/link';

/**
 * 2S Fashion store header: brand top-left, "Collection" centred, and
 * profile / search / wishlist / cart icons on the right. White bar with a
 * hairline divider, per the house style.
 */

const icon = 'h-[18px] w-[18px]';
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } as const;

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className={icon} {...stroke} aria-hidden>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20c1.4-3.4 4.1-5 7.2-5s5.8 1.6 7.2 5" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className={icon} {...stroke} aria-hidden>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15.2 15.2 20 20" strokeLinecap="round" />
    </svg>
  );
}
function WishlistIcon() {
  return (
    <svg viewBox="0 0 24 24" className={icon} {...stroke} aria-hidden>
      <path d="M12 20s-7.2-4.6-9-9c-1.1-2.7.5-6 3.6-6 2 0 3.6 1.2 5.4 3.4C13.8 6.2 15.4 5 17.4 5c3.1 0 4.7 3.3 3.6 6-1.8 4.4-9 9-9 9Z" strokeLinejoin="round" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className={icon} {...stroke} aria-hidden>
      <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
      <path d="M9 8V6.8a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 grid h-14 grid-cols-[1fr_auto_1fr] items-center
      border-b border-line bg-white/95 px-4 backdrop-blur md:px-10">
      <Link href="/" className="justify-self-start whitespace-nowrap font-serif text-base tracking-[0.12em] md:text-lg md:tracking-[0.18em]">
        2S Fashion
      </Link>

      <nav className="justify-self-center" aria-label="Primary">
        <Link
          href="/collection"
          className="text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-60 md:text-[11px] md:tracking-[0.24em]"
        >
          Collection
        </Link>
      </nav>

      <div className="flex items-center gap-3 justify-self-end md:gap-6">
        <Link href="/account" aria-label="Profile" className="transition-opacity hover:opacity-60"><ProfileIcon /></Link>
        <Link href="/search" aria-label="Search" className="transition-opacity hover:opacity-60"><SearchIcon /></Link>
        <Link href="/wishlist" aria-label="Wishlist" className="transition-opacity hover:opacity-60"><WishlistIcon /></Link>
        <Link href="/cart" aria-label="Cart" className="transition-opacity hover:opacity-60"><CartIcon /></Link>
      </div>
    </header>
  );
}
