import Link from 'next/link';

export function SliderHeader({ brand = 'ATELIER' }: { brand?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between
      px-6 py-5 md:px-12 mix-blend-difference text-white">
      <Link href="/" className="ui-in u1 font-serif text-lg tracking-[0.3em]">{brand}</Link>
      <nav className="flex gap-5 md:gap-8 text-[11px] uppercase tracking-[0.2em]">
        <Link href="/shop" className="ui-in u2 opacity-90 transition-opacity hover:opacity-60">Shop</Link>
        <Link href="/collections" className="ui-in u3 hidden opacity-90 transition-opacity hover:opacity-60 sm:inline">Collections</Link>
        <Link href="/about" className="ui-in u4 hidden opacity-90 transition-opacity hover:opacity-60 sm:inline">About</Link>
        <Link href="/cart" className="ui-in u5 opacity-90 transition-opacity hover:opacity-60">Cart (0)</Link>
      </nav>
    </header>
  );
}
