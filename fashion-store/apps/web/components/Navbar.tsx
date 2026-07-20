import Link from 'next/link';

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference text-white
      flex items-center justify-between px-5 py-4 md:px-7">
      <Link href="/" className="font-serif text-xl tracking-[0.28em]">ATELIER</Link>
      <nav className="hidden md:flex gap-7 text-xs uppercase tracking-[0.18em]">
        <Link href="/shop" className="opacity-85 hover:opacity-100">Shop</Link>
        <Link href="/collections" className="opacity-85 hover:opacity-100">Collections</Link>
        <Link href="/about" className="opacity-85 hover:opacity-100">About</Link>
        <Link href="/journal" className="opacity-85 hover:opacity-100">Journal</Link>
        <Link href="/cart" className="opacity-85 hover:opacity-100">Cart (0)</Link>
      </nav>
      <button type="button" className="md:hidden text-xs uppercase tracking-[0.18em]">Menu</button>
    </header>
  );
}
