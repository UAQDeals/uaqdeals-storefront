import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SellUsedItemForm } from "./sell-used-item-form";

export const dynamic = "force-dynamic";

const VERTICAL_META: Record<string, { title: string; ctaLabel: string }> = {
  used_items: { title: "Sell an Item", ctaLabel: "Sell Item" },
  automotive: { title: "Submit Vehicle", ctaLabel: "Submit Vehicle" },
  real_estate: { title: "Submit Property", ctaLabel: "Submit Property" },
  fancy_numbers: { title: "List a Number", ctaLabel: "List Number" },
};

export default async function SellPage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const meta = VERTICAL_META[vertical];
  if (!meta) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    redirect(`/login?next=/marketplace/${vertical}/sell`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/marketplace/${vertical}`} className="text-sm text-neutral-500 hover:text-[#8E1B3A]">
        ← Back
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-neutral-900">{meta.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">Your listing will be reviewed by UAQ Deals before going live.</p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        {vertical === "used_items" ? (
          <SellUsedItemForm userId={auth.user.id} />
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-500">The {meta.ctaLabel} form is coming soon to the web.</p>
            <p className="mt-2 text-xs text-neutral-400">For now, please use the UAQ Deals mobile app.</p>
          </div>
        )}
      </div>
    </div>
  );
}
