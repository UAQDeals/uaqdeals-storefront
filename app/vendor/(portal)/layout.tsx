import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorPortalNav, VendorPillNav } from "./portal-nav";

export default async function VendorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/vendor/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, name, status, wallet_balance")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!vendor) redirect("/vendor/signup");
  if (vendor.status !== "approved" && vendor.status !== "active") {
    redirect("/vendor/pending");
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 pt-20 pb-40">
      <VendorPortalNav vendorName={vendor.name} />
      <main className="min-w-0 flex-1">
        <VendorPillNav />
        {children}
      </main>
    </div>
  );
}
