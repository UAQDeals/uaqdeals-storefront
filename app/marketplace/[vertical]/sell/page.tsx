import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SellUsedItemForm } from "./sell-used-item-form";

export const dynamic = "force-dynamic";

const VERTICAL_META: Record<string, { title: string; titleAr: string; ctaLabel: string; ctaLabelAr: string }> = {
  used_items: { title: "List Your Electronic Device", titleAr: "إدراج جهازك الإلكتروني", ctaLabel: "List Device", ctaLabelAr: "إدراج الجهاز" },
  automotive: { title: "Submit Vehicle", titleAr: "إضافة مركبة", ctaLabel: "Submit Vehicle", ctaLabelAr: "إضافة مركبة" },
  real_estate: { title: "Submit Property", titleAr: "إضافة عقار", ctaLabel: "Submit Property", ctaLabelAr: "إضافة عقار" },
  fancy_numbers: { title: "List a Number", titleAr: "إدراج رقم", ctaLabel: "List Number", ctaLabelAr: "إدراج رقم" },
};

export default async function SellPage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const meta = VERTICAL_META[vertical];
  if (!meta) notFound();

  const isRTL = (await getLocale()) === "ar";

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    redirect(`/login?next=/marketplace/${vertical}/sell`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/marketplace/${vertical}`} className="text-sm text-neutral-500 hover:text-[#8E1B3A]">
        {isRTL ? "← رجوع" : "← Back"}
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-neutral-900">{isRTL ? meta.titleAr : meta.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">{isRTL ? "ستتم مراجعة إعلانك من قبل UAQ Deals قبل نشره." : "Your listing will be reviewed by UAQ Deals before going live."}</p>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
        {vertical === "used_items" ? (
          <SellUsedItemForm userId={auth.user.id} />
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-500">{isRTL ? `نموذج ${meta.ctaLabelAr} قادم قريباً إلى الويب.` : `The ${meta.ctaLabel} form is coming soon to the web.`}</p>
            <p className="mt-2 text-xs text-neutral-400">{isRTL ? "في الوقت الحالي، يرجى استخدام تطبيق UAQ Deals للهاتف." : "For now, please use the UAQ Deals mobile app."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
