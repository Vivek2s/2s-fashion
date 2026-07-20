export function Footer() {
  const cols = [
    { h: 'Shop', items: ['New in', 'Womenswear', 'Menswear', 'Accessories'] },
    { h: 'Company', items: ['About', 'Journal', 'Stores', 'Careers'] },
    { h: 'Help', items: ['Shipping', 'Returns', 'Size guide', 'Contact'] },
  ];
  return (
    <footer className="border-t border-line px-5 md:px-7 py-12
      flex flex-wrap justify-between gap-6 text-sm text-muted">
      <div className="flex flex-wrap gap-14">
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="mb-3 text-[11px] uppercase tracking-[0.16em] text-ink">{c.h}</h4>
            <ul className="flex flex-col gap-2">
              {c.items.map((i) => <li key={i}><a href="#" className="hover:text-ink">{i}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div>© 2026 ATELIER — Copenhagen. All rights reserved.</div>
    </footer>
  );
}
