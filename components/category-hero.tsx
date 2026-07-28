const SUBTITLES: Record<string, string> = {
  "electronics": "Phones, gadgets & gaming, delivered across UAQ",
  "grocery": "Fresh essentials & daily needs, delivered today",
  "beauty": "Beauty, fragrance & personal care",
  "beauty & fragrance": "Beauty, fragrance & personal care",
  "home & kitchen": "Everything for a better home",
  "fashion": "Style for the whole family",
  "baby": "Everything your little one needs",
  "toys": "Play, learn & have fun",
  "books": "Books, stationery & more",
  "real estate": "Homes for sale & rent across Umm Al Quwain",
  "automotive": "Cars, bikes & rentals across Umm Al Quwain",
  "fancy numbers": "Premium mobile & plate numbers",
  "used items": "Quality pre-owned electronics",
  "sell your electronic devices": "Quality pre-owned electronics",
};

export function subtitleFor(name: string): string {
  return SUBTITLES[name.trim().toLowerCase()] ?? `Browse ${name} across Umm Al Quwain.`;
}

export function CategoryHero({
  title,
  subtitle,
  eyebrow = "UAQ Deals",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  const sub = subtitle ?? subtitleFor(title);
  return (
    <div className="bg-maroon-radial relative overflow-hidden border-b border-[color:var(--brand-border)]">
      {/* gold hairline + soft decorative glows */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
      <span className="pointer-events-none absolute -top-20 -end-20 h-64 w-64 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
      <span className="pointer-events-none absolute -bottom-24 -start-16 h-72 w-72 rounded-full bg-black/15 blur-2xl" aria-hidden />

      <div className="rise-in relative mx-auto max-w-[1320px] px-5 md:px-8 py-12 md:py-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-gold)]">
          {eyebrow}
        </p>
        <h1 className="font-display mt-2 text-[30px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[40px]">
          {title}
        </h1>
        <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-white/75 sm:text-[15px]">
          {sub}
        </p>
      </div>
    </div>
  );
}
