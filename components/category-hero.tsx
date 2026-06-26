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
    <div
      className="border-b border-[color:var(--brand-border)]"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-maroon) 0%, var(--brand-red) 60%, var(--brand-orange) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1320px] px-5 md:px-8 py-10">
        <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">
          {eyebrow}
        </p>
        <h1 className="text-white text-3xl md:text-4xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-white/75 mt-1.5 text-sm">{sub}</p>
      </div>
    </div>
  );
}
