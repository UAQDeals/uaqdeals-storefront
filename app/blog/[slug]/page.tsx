import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Calendar, User, Tag, ChevronRight, ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const revalidate = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select("title, meta_title, meta_description, cover_image, og_image")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return {
    title: data?.meta_title ?? data?.title ?? "Blog — UAQ Deals",
    description: data?.meta_description ?? undefined,
  };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) notFound();

  const { data: related } = await supabase
    .from("blogs")
    .select("id, title, slug, cover_image, category, published_at")
    .eq("status", "published")
    .eq("category", post.category ?? "")
    .neq("id", post.id)
    .limit(3);

  const tags = Array.isArray(post.tags) ? post.tags as string[] : [];

  return (
    <div className="mx-auto max-w-[760px] px-5 py-10 md:px-8 md:py-12">
      <nav className="mb-6 flex items-center gap-1.5 text-[12.5px] text-[color:var(--brand-muted)]">
        <Link href="/" className="transition hover:text-[color:var(--brand-maroon)]">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        <Link href="/blog" className="transition hover:text-[color:var(--brand-maroon)]">Blog</Link>
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        <span className="line-clamp-1 text-[color:var(--ink)]">{post.title}</span>
      </nav>

      <Reveal>
        {post.category && (
          <span className="eyebrow">{post.category}</span>
        )}

        <h1 className="font-display mt-2 text-[30px] font-semibold leading-[1.12] tracking-tight text-[color:var(--ink)] sm:text-[38px]">
          {post.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-[12.5px] text-[color:var(--brand-muted)]">
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {post.author}
            </span>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {fmtDate(post.published_at)}
            </span>
          )}
        </div>
        <div className="gold-rule mt-5" />
      </Reveal>

      {post.cover_image && (
        <Reveal delay={80}>
          <div className="mt-7 overflow-hidden rounded-2xl border border-[color:var(--brand-border)] shadow-[var(--shadow-card)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image} alt={post.title} className="max-h-[440px] w-full object-cover" />
          </div>
        </Reveal>
      )}

      {post.excerpt && (
        <p className="mt-7 border-s-[3px] border-[color:var(--brand-gold)] ps-4 text-[16px] font-medium leading-relaxed text-neutral-700">
          {post.excerpt}
        </p>
      )}

      {post.body && (
        <div className="prose prose-neutral mt-7 max-w-none text-[15px] leading-[1.75] text-neutral-700"
          dangerouslySetInnerHTML={{ __html: post.body }} />
      )}

      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-[color:var(--brand-border)] bg-[color:var(--paper-2)] px-3 py-1 text-[12px] font-medium text-neutral-600">
              <Tag className="h-3 w-3" /> {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-[color:var(--brand-border)] pt-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-[13.5px] font-bold text-[color:var(--brand-maroon)] transition hover:text-[color:var(--brand-maroon-deep)]">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Back to Blog
        </Link>
      </div>

      {(related ?? []).length > 0 && (
        <div className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <span className="accent-bar h-7 w-1.5 rounded-full" />
            <h2 className="font-display text-[20px] font-semibold text-[color:var(--ink)]">Related Posts</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {(related as Row[]).map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`}
                className="group premium-card overflow-hidden">
                <div className="aspect-[16/9] overflow-hidden bg-[color:var(--paper-2)]">
                  {r.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.cover_image} alt={r.title} className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-neutral-300">📝</div>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="font-display text-[13.5px] font-semibold leading-snug text-[color:var(--ink)] transition-colors line-clamp-2 group-hover:text-[color:var(--brand-maroon)]">{r.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
