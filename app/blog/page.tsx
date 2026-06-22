import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Tag, ChevronRight } from "lucide-react";

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-6 flex items-center gap-1 text-xs text-neutral-500">
        <Link href="/" className="hover:text-[color:var(--brand-maroon)]">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-700">Blog</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">UAQ Deals Blog</h1>
        <p className="mt-2 text-neutral-500">News, tips and stories from Umm Al Quwain</p>
      </div>

      {rows.length === 0 ? (
        <div className="py-20 text-center text-neutral-400">No posts published yet.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`}
              className="group flex flex-col border border-neutral-200 bg-white hover:border-neutral-400 transition-colors">
              <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                {p.cover_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image} alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-neutral-300 text-4xl">📝</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                {p.category && (
                  <span className="mb-2 text-[10.5px] font-bold uppercase tracking-widest text-[color:var(--brand-maroon)]">
                    {p.category}
                  </span>
                )}
                <h2 className="text-[15px] font-bold leading-snug text-neutral-900 group-hover:text-[color:var(--brand-maroon)] transition-colors line-clamp-2">
                  {p.title}
                </h2>
                {p.excerpt && (
                  <p className="mt-2 text-[13px] text-neutral-500 leading-relaxed line-clamp-2">{p.excerpt}</p>
                )}
                <div className="mt-auto pt-3 flex items-center gap-3 text-[11px] text-neutral-400">
                  {p.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {fmtDate(p.published_at)}
                    </span>
                  )}
                  {p.author && <span>by {p.author}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
