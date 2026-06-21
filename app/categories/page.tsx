import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { CategoriesBrowser } from "@/components/categories-browser";

export async function generateMetadata() {
  const t = await getTranslations("categoriesPage");
  return { title: t("title") };
}
export const revalidate = 300;

export default async function CategoriesPage() {
  const supabase = await createClient();
  const t = await getTranslations("categoriesPage");
  const { data } = await supabase
    .from("vendor_types")
    .select("id, name, slug, icon, description")
    .eq("is_active", true)
    .eq("is_product", true)
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("name");

  const items = (data ?? []).map((v) => ({
    id: v.id as string,
    name: v.name as string,
    slug: v.slug as string,
    icon: (v.icon as string | null) ?? null,
    description: (v.description as string | null) ?? null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
      <p className="mt-2 max-w-xl text-base text-neutral-600">{t("subtitle")}</p>
      <CategoriesBrowser items={items} />
    </div>
  );
}
