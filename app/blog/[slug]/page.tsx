import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Calendar, User, Tag, ChevronRight, ArrowLeft } from "lucide-react";

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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-6 flex items-center gap-1 text-xs text-neutral-500">
        <Link href="/" className="hover:text-[color:var(--brand-maroon)]">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-[color:var(--brand-maroon)]">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 text-neutral-700">{post.title}</span>
      </nav>

      {post.category && (
        <span className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--brand-maroon)]">
          {post.category}
        </span>
      )}

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight sm:text-4xl">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[12.5px] text-neutral-500 border-b border-neutral-100 pb-4">
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

      {post.cover_image && (
        <div className="mt-6 overflow-hidden border border-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover_image} alt={post.title} className="w-full object-cover max-h-[420px]" />
        </div>
      )}

      {post.excerpt && (
        <p className="mt-6 text-[15px] font-medium text-neutral-600 leading-relaxed border-l-4 border-[color:var(--brand-maroon)] pl-4">
          {post.excerpt}
        </p>
      )}

      {post.body && (
        <div className="mt-6 prose prose-neutral max-w-none text-[14.5px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.body }} />
      )}

      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600">
              <Tag className="h-3 w-3" /> {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-neutral-100 pt-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-[color:var(--brand-maroon)] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
      </div>

      {(related ?? []).length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-4">Related Posts</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(related as Row[]).map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`}
                className="group border border-neutral-200 bg-white hover:border-neutral-400 transition-colors">
                <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                  {r.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.cover_image} alt={r.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-300 text-2xl">📝</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-[color:var(--brand-maroon)] transition-colors">{r.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
