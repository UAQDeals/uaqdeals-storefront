import { createClient } from "@/lib/supabase/server";
import { JobPortalClient } from "./client";

export const metadata = { title: "Job Portal — UAQ Deals" };
export const revalidate = 60;

export default async function JobPortalPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: jobs } = await supabase
    .from("job_listings")
    .select("id, title, company_name, location, industry, job_type, salary_label, description, requirements")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  // User's own job posting submissions (if logged in)
  let mySubmissions: any[] = [];
  if (user) {
    const { data } = await supabase
      .from("job_posting_requests")
      .select("id, title, company_name, status, admin_note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    mySubmissions = data ?? [];
  }

  return (
    <JobPortalClient
      jobs={jobs ?? []}
      mySubmissions={mySubmissions}
      isLoggedIn={!!user}
    />
  );
}
