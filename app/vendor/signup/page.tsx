import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VendorSignupForm } from "./signup-form";

export const metadata = { title: "Become a Vendor — UAQ Deals" };

export default async function VendorSignupPage() {
  // If already logged in and a vendor, send them to the portal
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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <Image src="/uaq_logo.png" alt="UAQ Deals" width={120} height={40} priority className="mx-auto h-12 w-auto" />
        <h1 className="text-brand-gradient mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Become a Vendor
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Join UAQ Deals and start selling to customers across Umm Al Quwain.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <VendorSignupForm />
      </div>

      <p className="mt-6 text-center text-xs text-neutral-500">
        By applying you agree to UAQ Deals&apos;{" "}
        <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
