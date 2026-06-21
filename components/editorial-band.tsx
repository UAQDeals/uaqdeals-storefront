import Link from "next/link";

export type EditorialBandProps = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  emoji: string;
  flip?: boolean; // true = text left, image right (default false = image left, text right)
  dark?: boolean; // true = dark bg (default), false = light bg
};

export function EditorialBand({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
  emoji,
  flip = false,
  dark = true,
}: EditorialBandProps) {
  const bg = dark ? "bg-neutral-900" : "bg-[#f5f0ee]";
  const eyebrowColor = dark ? "text-neutral-500" : "text-[color:var(--brand-maroon)]";
  const titleColor = dark ? "text-white" : "text-neutral-900";
  const bodyColor = dark ? "text-neutral-400" : "text-neutral-600";
  const ctaBg = dark ? "bg-white text-neutral-900 hover:bg-neutral-100" : "bg-neutral-900 text-white hover:bg-neutral-700";

  const imgBlock = (
    <div
      className="hidden md:flex items-center justify-center text-8xl min-h-[300px]"
      style={{ background: dark ? "#1a1a1a" : "#e8ddd4" }}
    >
      {emoji}
    </div>
  );

  const textBlock = (
    <div className="flex flex-col justify-center px-8 md:px-14 py-14">
      <p className={`text-[10.5px] font-bold tracking-[2px] uppercase mb-3 ${eyebrowColor}`}>
        {eyebrow}
      </p>
      <h2 className={`text-[28px] md:text-[34px] font-extrabold leading-[1.1] tracking-[-1px] mb-4 ${titleColor}`}>
        {title}
      </h2>
      <p className={`text-[13.5px] leading-relaxed mb-8 max-w-sm ${bodyColor}`}>
        {body}
      </p>
      <Link
        href={ctaHref}
        className={`inline-block self-start px-7 py-3 text-[13px] font-bold tracking-wide transition-colors ${ctaBg}`}
      >
        {ctaLabel}
      </Link>
    </div>
  );

  return (
    <section className={`w-full ${bg}`}>
      <div className="mx-auto max-w-[1320px] grid grid-cols-1 md:grid-cols-2 min-h-[300px]">
        {flip ? (
          <>
            {textBlock}
            {imgBlock}
          </>
        ) : (
          <>
            {imgBlock}
            {textBlock}
          </>
        )}
      </div>
    </section>
  );
}
