import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

export type EditorialBandProps = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  emoji: string;
  flip?: boolean;
  dark?: boolean;
  bgImage?: string; // optional full-width background image
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
  bgImage,
}: EditorialBandProps) {
  const onDark = dark || !!bgImage;
  const eyebrowColor = onDark ? "text-[color:var(--brand-gold)]" : "text-[color:var(--brand-maroon)]";
  const titleColor = onDark ? "text-white" : "text-[color:var(--ink)]";
  const bodyColor = onDark ? "text-white/75" : "text-neutral-600";
  const ctaClass = onDark
    ? "bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-[#2a1408] shadow-lg hover:brightness-105"
    : "bg-[color:var(--brand-maroon)] text-white shadow-lg hover:bg-[color:var(--brand-maroon-deep)]";

  const imgBlock = bgImage ? null : (
    <div
      className={`group/img relative hidden items-center justify-center overflow-hidden md:flex min-h-[320px] ${
        dark ? "bg-maroon-radial" : "bg-[color:var(--paper-2)]"
      }`}
    >
      <span className="pointer-events-none absolute -end-12 -top-12 h-48 w-48 rounded-full bg-[color:var(--brand-gold)]/15 blur-3xl" aria-hidden />
      <span className="pointer-events-none absolute -start-12 -bottom-12 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/10 blur-3xl" aria-hidden />
      <Reveal className="relative">
        <span className="animate-floaty flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[color:var(--brand-gold)] to-[color:var(--brand-gold-deep)] text-6xl shadow-[var(--shadow-premium)] ring-1 ring-white/20">
          {emoji}
        </span>
      </Reveal>
    </div>
  );

  const textBlock = (
    <div className="flex flex-col justify-center px-8 py-14 md:px-14">
      <Reveal>
        <div className="mb-4 flex items-center gap-3.5">
          <span className="accent-bar h-9 w-1.5 rounded-full" />
          <p className={`eyebrow ${eyebrowColor}`}>{eyebrow}</p>
        </div>
        <h2 className={`font-display mb-4 text-[28px] font-semibold leading-[1.12] tracking-tight md:text-[36px] ${titleColor}`}>
          {title}
        </h2>
        <p className={`mb-8 max-w-sm text-[13.5px] leading-relaxed ${bodyColor}`}>{body}</p>
        <Link
          href={ctaHref}
          className={`inline-flex items-center gap-1.5 self-start rounded-full px-7 py-3 text-[13px] font-bold tracking-wide transition ${ctaClass}`}
        >
          {ctaLabel}
          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
        </Link>
      </Reveal>
    </div>
  );

  return (
    <section
      className={`relative w-full overflow-hidden ${bgImage ? "" : dark ? "bg-maroon-radial" : "bg-[color:var(--paper-2)]"}`}
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {bgImage && <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/60 to-transparent" aria-hidden />
      <div
        className={`relative mx-auto max-w-[1320px] min-h-[320px] ${
          bgImage ? "flex items-center" : "grid grid-cols-1 md:grid-cols-2"
        }`}
      >
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
