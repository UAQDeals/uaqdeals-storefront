import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Calendar, ChevronRight, FileText } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const revalidate = 60;
export const metadata = { title: "Blog — UAQ Deals" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogListPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blogs")
    .select("id, title, slug, excerpt, cover_image, author, category, tags, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(24);

  const rows = posts ?? [];

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-10 md:px-8 md:py-12">
      <nav className="mb-6 flex items-center gap-1.5 text-[12.5px] text-[color:var(--brand-muted)]">
        <Link href="/" className="transition hover:text-[color:var(--brand-maroon)]">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        <span className="text-[color:var(--ink)]">Blog</span>
      </nav>

      <Reveal>
        <div className="mb-8">
          <h1 className="font-display text-[30px] font-semibold tracking-tight text-[color:var(--ink)] sm:text-[38px]">UAQ Deals Blog</h1>
          <p className="mt-2 text-[15px] text-[color:var(--brand-muted)]">News, tips and stories from Umm Al Quwain</p>
          <div className="gold-rule mt-7" />
        </div>
      </Reveal>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
            <FileText className="h-7 w-7" />
          </span>
          <p className="font-display text-[18px] font-semibold text-[color:var(--ink)]">No posts published yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 70}>
              <Link href={`/blog/${p.slug}`} className="group premium-card flex h-full flex-col overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden bg-[color:var(--paper-2)]">
                  {p.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover_image} alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-neutral-300">📝</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {p.category && (
                    <span className="eyebrow mb-2">{p.category}</span>
                  )}
                  <h2 className="font-display text-[17px] font-semibold leading-snug text-[color:var(--ink)] transition-colors line-clamp-2 group-hover:text-[color:var(--brand-maroon)]">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-2 text-[13px] leading-relaxed text-neutral-600 line-clamp-2">{p.excerpt}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3 text-[11.5px] text-[color:var(--brand-muted)]">
                      {p.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {fmtDate(p.published_at)}
                        </span>
                      )}
                      {p.author && <span>by {p.author}</span>}
                    </div>
                    <span className="text-[12.5px] font-bold text-[color:var(--brand-maroon)] transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                      Read more →
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
