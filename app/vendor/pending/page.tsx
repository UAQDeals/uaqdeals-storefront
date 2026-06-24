import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PendingActions } from "./pending-actions";

export const metadata = { title: "Application Under Review — UAQ Deals" };

export default async function VendorPendingPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) redirect("/vendor/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("name, status")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!vendor) redirect("/vendor/signup");
  if (vendor.status === "approved" || vendor.status === "active") {
    redirect("/vendor/dashboard");
  }

  const rejected = vendor.status === "rejected";

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <Image src="/uaq_logo.png" alt="UAQ Deals" width={120} height={40} priority className="mx-auto h-12 w-auto" />
      <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        {rejected ? (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">✕</div>
            <h1 className="mt-4 text-xl font-bold text-neutral-900">Application Not Approved</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Unfortunately your vendor application for <strong>{vendor.name}</strong> was not approved.
              Please contact our team for more information.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl">⏳</div>
            <h1 className="mt-4 text-xl font-bold text-neutral-900">Application Under Review</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Thanks for applying, <strong>{vendor.name}</strong>! Our team is reviewing your
              application. You&apos;ll get access to your vendor dashboard once approved.
            </p>
            <p className="mt-3 text-xs text-neutral-400">
              This usually takes 1–2 business days. You can check back anytime by signing in.
            </p>
          </>
        )}
        <div className="mt-6">
          <PendingActions />
        </div>
      </div>
      <p className="mt-6 text-xs text-neutral-500">
        Need help? <Link href="/contact" className="font-semibold text-[#8E1B3A] underline">Contact us</Link>
      </p>
    </div>
  );
}
