import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorLoginForm } from "./login-form";

export const metadata = { title: "Vendor Sign In — UAQ Deals" };

export default async function VendorLoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data?.user) {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("status")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (vendor) {
      redirect(vendor.status === "approved" || vendor.status === "active"
        ? "/vendor/dashboard"
        : "/vendor/pending");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-brand-gradient text-3xl font-extrabold tracking-tight">Vendor Portal</h1>
        <p className="mt-2 text-sm text-neutral-600">Sign in to manage your store.</p>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <VendorLoginForm />
      </div>
    </div>
  );
}
