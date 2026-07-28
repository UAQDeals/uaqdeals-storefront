"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft, Briefcase, MapPin, Clock, DollarSign,
  ChevronRight, X, Send, Upload, CheckCircle, FileText,
  Building2, ListChecks, Hourglass, XCircle, Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Reveal } from "@/components/reveal";

type Job = {
  id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  industry: string | null;
  job_type: string | null;
  salary_label: string | null;
  description: string | null;
  requirements: string | null;
};

type Submission = {
  id: string;
  title: string;
  company_name: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
};

const JOB_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship"];
const POST_JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

// Display-only label for job-type values (underlying value stays English).
function jobTypeLabel(t: string, isRTL: boolean) {
  if (!isRTL) return t;
  switch (t) {
    case "All": return "الكل";
    case "Full-time": return "دوام كامل";
    case "Part-time": return "دوام جزئي";
    case "Contract": return "عقد";
    case "Internship": return "تدريب";
    default: return t;
  }
}

// ── Tag chip ──────────────────────────────────────────────────────────────────
function Tag({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[color:var(--paper-2)] text-[color:var(--brand-maroon)]">
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

// ── Apply modal (with CV upload) ──────────────────────────────────────────────
function ApplyModal({
  job, isLoggedIn, onClose,
}: {
  job: Job; isLoggedIn: boolean; onClose: () => void;
}) {
  const isRTL = useLocale() === "ar";
  const supabase = createClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!isLoggedIn) { toast.error(isRTL ? "يرجى تسجيل الدخول للتقديم" : "Please sign in to apply"); return; }
    if (!cvFile) { toast.error(isRTL ? "يرجى إرفاق سيرتك الذاتية" : "Please attach your CV/resume"); return; }
    if (!name.trim() || !phone.trim()) { toast.error(isRTL ? "يرجى إدخال اسمك ورقم هاتفك" : "Please enter your name and phone"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error(isRTL ? "يرجى تسجيل الدخول للتقديم" : "Please sign in to apply"); setLoading(false); return; }

      // Upload CV to 'resumes' bucket: userId/timestamp.ext
      const ext = cvFile.name.split(".").pop() ?? "pdf";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(path, cvFile);
      if (upErr) throw new Error((isRTL ? "فشل رفع السيرة الذاتية: " : "CV upload failed: ") + upErr.message);
      const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(path);

      const { error } = await supabase.from("job_applications").insert({
        user_id: user.id,
        listing_id: job.id,
        job_title: job.title,
        company_name: job.company_name,
        cv_url: publicUrl,
        cover_note: note.trim() || null,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        status: "pending",
      });
      if (error) throw error;
      toast.success(isRTL ? "تم إرسال الطلب!" : "Application submitted!");
      onClose();
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذر الإرسال" : "Could not submit")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92dvh] overflow-y-auto p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[18px] font-semibold text-[color:var(--ink)]">{isRTL ? "التقديم على هذه الوظيفة" : "Apply for this Job"}</h3>
            <p className="text-[12px] text-[color:var(--brand-muted)] mt-0.5 line-clamp-1">{job.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-[color:var(--paper-2)] shrink-0 transition hover:brightness-95">
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        {/* CV upload */}
        <div>
          <p className="text-[13px] font-bold text-[color:var(--ink)] mb-2">{isRTL ? "السيرة الذاتية" : "CV / Resume"} <span className="text-red-500">*</span></p>
          {cvFile ? (
            <div className="flex items-center gap-2 p-3 rounded-xl border"
              style={{ background: "#F0FDF4", borderColor: "#86EFAC" }}>
              <FileText className="w-4 h-4" style={{ color: "#16A34A" }} />
              <span className="flex-1 text-[12px] font-semibold truncate" style={{ color: "#16A34A" }}>{cvFile.name}</span>
              <button onClick={() => setCvFile(null)}><X className="w-4 h-4 text-red-500" /></button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-[color:var(--brand-gold)]/50 bg-[color:var(--paper-2)]/40 cursor-pointer transition hover:bg-[color:var(--paper-2)]">
              <Upload className="w-4 h-4 text-[color:var(--brand-maroon)]" />
              <span className="text-[13px] font-semibold text-[color:var(--brand-maroon)]">{isRTL ? "رفع السيرة الذاتية (PDF أو صورة)" : "Upload CV (PDF or image)"}</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" className="hidden"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} />
            </label>
          )}
        </div>

        {/* Fields */}
        <input value={name} onChange={e => setName(e.target.value)} placeholder={isRTL ? "الاسم الكامل *" : "Full Name *"}
          className="w-full h-12 rounded-xl border border-[color:var(--brand-border)] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]" />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={isRTL ? "رقم الهاتف *" : "Phone Number *"} type="tel"
          className="w-full h-12 rounded-xl border border-[color:var(--brand-border)] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder={isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"} type="email"
          className="w-full h-12 rounded-xl border border-[color:var(--brand-border)] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]" />
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
          placeholder={isRTL ? "ملاحظة تعريفية (اختياري) — لماذا أنت الأنسب" : "Cover note (optional) — why you're a great fit"}
          className="w-full rounded-xl border border-[color:var(--brand-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)]" />

        <button onClick={submit} disabled={loading}
          className="bg-brand-gradient w-full h-12 rounded-full text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-[var(--shadow-card)] hover:brightness-110 transition disabled:opacity-60">
          {loading ? (isRTL ? "جارٍ الإرسال..." : "Submitting...") : <><Send className="w-4 h-4" /> {isRTL ? "إرسال الطلب" : "Submit Application"}</>}
        </button>
      </div>
    </div>
  );
}

// ── Job detail modal ──────────────────────────────────────────────────────────
function JobDetailModal({
  job, onApply, onClose,
}: {
  job: Job; onApply: () => void; onClose: () => void;
}) {
  const isRTL = useLocale() === "ar";
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92dvh] overflow-y-auto p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[19px] font-semibold text-[color:var(--ink)] leading-snug">{job.title}</h3>
            <p className="text-[13px] text-[color:var(--brand-muted)] mt-0.5">{job.company_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-[color:var(--paper-2)] shrink-0 transition hover:brightness-95">
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {job.location && <Tag icon={MapPin} label={job.location} />}
          {job.job_type && <Tag icon={Clock} label={jobTypeLabel(job.job_type, isRTL)} />}
          {job.salary_label && <Tag icon={DollarSign} label={job.salary_label} />}
        </div>

        {job.description && (
          <div>
            <p className="text-[13px] font-bold text-[color:var(--ink)] mb-1.5">{isRTL ? "الوصف" : "Description"}</p>
            <p className="text-[13px] text-neutral-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>
        )}
        {job.requirements && (
          <div>
            <p className="text-[13px] font-bold text-[color:var(--ink)] mb-1.5">{isRTL ? "المتطلبات" : "Requirements"}</p>
            <p className="text-[13px] text-neutral-600 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
          </div>
        )}

        <button onClick={onApply}
          className="bg-brand-gradient w-full h-12 rounded-full text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-[var(--shadow-card)] hover:brightness-110 transition">
          <Send className="w-4 h-4" /> {isRTL ? "قدّم الآن" : "Apply Now"}
        </button>
      </div>
    </div>
  );
}

// ── Find a Job tab ────────────────────────────────────────────────────────────
function FindJobTab({ jobs, isLoggedIn }: { jobs: Job[]; isLoggedIn: boolean }) {
  const isRTL = useLocale() === "ar";
  const [filter, setFilter] = useState("All");
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  const visible = filter === "All" ? jobs : jobs.filter(j => j.job_type === filter);

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {JOB_TYPES.map(t => {
          const active = t === filter;
          return (
            <button key={t} onClick={() => setFilter(t)}
              className={"shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap border transition-colors " +
                (active
                  ? "bg-brand-gradient text-white border-transparent shadow-[var(--shadow-card)]"
                  : "bg-white text-neutral-700 border-[color:var(--brand-border)] hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)]")}>
              {jobTypeLabel(t, isRTL)}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--paper-2)] text-4xl ring-1 ring-[color:var(--brand-gold)]/30">💼</span>
          <p className="font-display text-[18px] font-semibold text-[color:var(--ink)]">{isRTL ? "لا توجد وظائف" : "No jobs found"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map((job, i) => (
            <Reveal key={job.id} delay={i * 45}>
              <button onClick={() => setDetailJob(job)}
                className="group premium-card text-start p-4 w-full h-full block">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[color:var(--paper-2)] ring-1 ring-[color:var(--brand-gold)]/25">
                    <Briefcase className="w-5 h-5 text-[color:var(--brand-maroon)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[color:var(--ink)] truncate">{job.title}</p>
                    <p className="text-[12px] text-[color:var(--brand-muted)] truncate">{job.company_name}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 transition group-hover:text-[color:var(--brand-maroon)] group-hover:translate-x-0.5 rtl:rotate-180" />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.location && <Tag icon={MapPin} label={job.location} />}
                  {job.job_type && <Tag icon={Clock} label={jobTypeLabel(job.job_type, isRTL)} />}
                  {job.salary_label && <Tag icon={DollarSign} label={job.salary_label} />}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      {detailJob && (
        <JobDetailModal
          job={detailJob}
          onApply={() => { setApplyJob(detailJob); setDetailJob(null); }}
          onClose={() => setDetailJob(null)}
        />
      )}
      {applyJob && (
        <ApplyModal job={applyJob} isLoggedIn={isLoggedIn} onClose={() => setApplyJob(null)} />
      )}
    </div>
  );
}

// ── My submissions ────────────────────────────────────────────────────────────
function statusMeta(s: string, isRTL: boolean) {
  switch (s) {
    case "approved": return { color: "#16A34A", Icon: CheckCircle, label: isRTL ? "مقبول" : "APPROVED" };
    case "rejected": return { color: "#DC2626", Icon: XCircle, label: isRTL ? "مرفوض" : "REJECTED" };
    default: return { color: "#EA580C", Icon: Hourglass, label: isRTL ? "قيد المراجعة" : "PENDING" };
  }
}

function MySubmissions({ submissions }: { submissions: Submission[] }) {
  const isRTL = useLocale() === "ar";
  if (submissions.length === 0) {
    return <p className="text-[13px] text-neutral-400 py-4 text-center">{isRTL ? "لا توجد طلبات بعد" : "No submissions yet"}</p>;
  }
  return (
    <div className="space-y-2.5">
      {submissions.map(p => {
        const { color, Icon, label } = statusMeta(p.status, isRTL);
        return (
          <div key={p.id} className="premium-card p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-bold text-[color:var(--ink)] truncate">{p.title}</p>
              <span className="flex items-center gap-1 shrink-0" style={{ color }}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">{label}</span>
              </span>
            </div>
            <p className="text-[11px] text-[color:var(--brand-muted)] mt-0.5">{p.company_name}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {isRTL ? "تم الإرسال " : "Submitted "}{new Date(p.created_at).toLocaleDateString(isRTL ? "ar-AE" : "en-AE", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            {p.admin_note && (
              <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg" style={{ background: "#FEF2F2" }}>
                <Info className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "#DC2626" }} />
                <p className="text-[11px]" style={{ color: "#DC2626" }}>{p.admin_note}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Post a Job tab ────────────────────────────────────────────────────────────
function PostJobTab({
  mySubmissions, isLoggedIn,
}: {
  mySubmissions: Submission[]; isLoggedIn: boolean;
}) {
  const isRTL = useLocale() === "ar";
  const router = useRouter();
  const supabase = createClient();
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  async function submit() {
    if (!isLoggedIn) { toast.error(isRTL ? "يرجى تسجيل الدخول لنشر وظيفة" : "Please sign in to post a job"); return; }
    if (!title.trim() || !company.trim()) { toast.error(isRTL ? "المسمى الوظيفي واسم الشركة مطلوبان" : "Job title and company name are required"); return; }
    if (!contactPhone.trim()) { toast.error(isRTL ? "رقم هاتف التواصل مطلوب" : "Contact phone is required"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error(isRTL ? "يرجى تسجيل الدخول لنشر وظيفة" : "Please sign in to post a job"); setLoading(false); return; }

      const { error } = await supabase.from("job_posting_requests").insert({
        user_id: user.id,
        title: title.trim(),
        company_name: company.trim(),
        location: location.trim() || null,
        industry: industry.trim() || null,
        job_type: jobType,
        salary_label: salary.trim() || null,
        description: description.trim() || null,
        requirements: requirements.trim() || null,
        contact_name: contactName.trim() || null,
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || null,
        status: "pending",
      });
      if (error) throw error;
      toast.success(isRTL ? "تم نشر الوظيفة! بانتظار موافقة UAQ Deals." : "Job posted! Pending UAQ Deals approval.");
      // reset
      setTitle(""); setCompany(""); setLocation(""); setIndustry("");
      setSalary(""); setJobType(null); setDescription(""); setRequirements("");
      setContactName(""); setContactPhone(""); setContactEmail("");
      setShowMyPosts(true);
      router.refresh();
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذر الإرسال" : "Could not submit")));
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full h-12 rounded-xl border border-[color:var(--brand-border)] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white";

  return (
    <div className="space-y-5">
      {/* My submissions toggle */}
      <button onClick={() => setShowMyPosts(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[color:var(--brand-gold)]/40 bg-[color:var(--paper-2)]/60 transition hover:bg-[color:var(--paper-2)]">
        <ListChecks className="w-4 h-4 text-[color:var(--brand-maroon)]" />
        <span className="flex-1 text-start text-[13px] font-semibold text-[color:var(--brand-maroon)]">{isRTL ? "طلبات الوظائف الخاصة بي" : "My Job Submissions"}</span>
        <ChevronRight className="w-4 h-4 text-[color:var(--brand-maroon)] transition-transform" style={{ transform: showMyPosts ? "rotate(90deg)" : undefined }} />
      </button>

      {showMyPosts && <MySubmissions submissions={mySubmissions} />}

      {/* Header */}
      <div className="bg-maroon-radial relative overflow-hidden rounded-2xl p-5">
        <span className="pointer-events-none absolute -top-10 -end-10 h-32 w-32 rounded-full bg-[color:var(--brand-gold)]/15 blur-2xl" aria-hidden />
        <div className="relative flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[color:var(--brand-gold)]" />
          <p className="font-display text-[17px] font-semibold text-white">{isRTL ? "نشر وظيفة" : "Post a Job"}</p>
        </div>
        <p className="relative text-[12px] text-white/80 mt-1.5">{isRTL ? "املأ التفاصيل أدناه. ستقوم UAQ Deals بمراجعة إعلانك ونشره خلال 24 ساعة." : "Fill in the details below. UAQ Deals will review and publish your listing within 24 hours."}</p>
      </div>

      {/* Job details */}
      <div className="space-y-2.5">
        <p className="text-[13px] font-bold text-[color:var(--ink)]">{isRTL ? "تفاصيل الوظيفة" : "Job Details"}</p>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder={isRTL ? "المسمى الوظيفي *" : "Job Title *"} className={inputCls} />
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder={isRTL ? "اسم الشركة / النشاط التجاري *" : "Company / Business Name *"} className={inputCls} />
        <div className="grid grid-cols-2 gap-2.5">
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder={isRTL ? "الموقع" : "Location"} className={inputCls} />
          <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder={isRTL ? "المجال" : "Industry"} className={inputCls} />
        </div>
        <input value={salary} onChange={e => setSalary(e.target.value)} placeholder={isRTL ? "الراتب (مثال: 3,000 درهم/شهر)" : "Salary (e.g. AED 3,000/month)"} className={inputCls} />
      </div>

      {/* Job type */}
      <div>
        <p className="text-[12px] font-semibold text-[color:var(--brand-muted)] mb-2">{isRTL ? "نوع الوظيفة" : "Job Type"}</p>
        <div className="flex flex-wrap gap-2">
          {POST_JOB_TYPES.map(t => {
            const active = jobType === t;
            return (
              <button key={t} onClick={() => setJobType(t)}
                className={"px-3.5 py-2 rounded-full text-[12px] font-semibold border transition-colors " +
                  (active
                    ? "bg-brand-gradient text-white border-transparent shadow-[var(--shadow-card)]"
                    : "bg-white text-neutral-700 border-[color:var(--brand-border)] hover:border-[color:var(--brand-maroon)] hover:text-[color:var(--brand-maroon)]")}>
                {jobTypeLabel(t, isRTL)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2.5">
        <p className="text-[13px] font-bold text-[color:var(--ink)]">{isRTL ? "الوصف والمتطلبات" : "Description & Requirements"}</p>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
          placeholder={isRTL ? "وصف الوظيفة — ما تتضمنه المهمة" : "Job description — what the role involves"}
          className="w-full rounded-xl border border-[color:var(--brand-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white" />
        <textarea value={requirements} onChange={e => setRequirements(e.target.value)} rows={3}
          placeholder={isRTL ? "المتطلبات — الخبرة والمهارات والمؤهلات" : "Requirements — experience, skills, qualifications"}
          className="w-full rounded-xl border border-[color:var(--brand-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-gold)]/40 focus:border-[color:var(--brand-maroon)] bg-white" />
      </div>

      {/* Contact */}
      <div className="space-y-2.5">
        <p className="text-[13px] font-bold text-[color:var(--ink)]">{isRTL ? "بيانات التواصل الخاصة بك" : "Your Contact Details"}</p>
        <p className="text-[11px] text-neutral-400">{isRTL ? "ستستخدم UAQ Deals هذه البيانات للتحقق والتواصل معك بشأن هذا الإعلان." : "UAQ Deals will use these to verify and contact you about this posting."}</p>
        <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder={isRTL ? "اسمك" : "Your Name"} className={inputCls} />
        <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder={isRTL ? "رقم الهاتف *" : "Phone Number *"} type="tel" className={inputCls} />
        <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder={isRTL ? "البريد الإلكتروني (اختياري)" : "Email (optional)"} type="email" className={inputCls} />
      </div>

      <button onClick={submit} disabled={loading}
        className="bg-brand-gradient w-full h-12 rounded-full text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-[var(--shadow-card)] hover:brightness-110 transition disabled:opacity-60">
        {loading ? (isRTL ? "جارٍ الإرسال..." : "Submitting...") : <><Send className="w-4 h-4" /> {isRTL ? "إرسال للمراجعة" : "Submit for Review"}</>}
      </button>
      <p className="text-center text-[11px] text-neutral-400">{isRTL ? "تتم المراجعة خلال 24 ساعة • يُنشر فقط بعد الموافقة" : "Reviewed within 24 hours • Published only after approval"}</p>
    </div>
  );
}

// ── Main client ───────────────────────────────────────────────────────────────
export function JobPortalClient({
  jobs, mySubmissions, isLoggedIn,
}: {
  jobs: Job[]; mySubmissions: Submission[]; isLoggedIn: boolean;
}) {
  const isRTL = useLocale() === "ar";
  const router = useRouter();
  const [tab, setTab] = useState<"find" | "post">("find");

  return (
    <div className="min-h-screen bg-[color:var(--paper)]">
      {/* App bar */}
      <div className="bg-maroon-radial relative overflow-hidden sticky top-0 z-30">
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[color:var(--brand-gold)]/70 to-transparent" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-white/10 border border-[color:var(--brand-gold)]/25 backdrop-blur-sm transition hover:bg-white/20">
            <ChevronLeft className="w-5 h-5 text-white rtl:rotate-180" />
          </button>
          <h1 className="font-display text-[18px] font-semibold text-white flex-1">{isRTL ? "بوابة الوظائف" : "Job Portal"}</h1>
        </div>
        {/* Tabs */}
        <div className="relative mx-auto max-w-5xl px-4 flex gap-2 pb-3">
          {([["find", isRTL ? "ابحث عن وظيفة" : "Find a Job"], ["post", isRTL ? "نشر وظيفة" : "Post a Job"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={"rounded-full px-6 py-1.5 text-[13px] font-semibold border transition-colors " +
                (tab === key
                  ? "border-[color:var(--brand-gold)]/60 bg-white text-[color:var(--brand-maroon)]"
                  : "border-white/20 bg-white/10 text-white/80 backdrop-blur-sm hover:bg-white/20")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {tab === "find"
          ? <FindJobTab jobs={jobs} isLoggedIn={isLoggedIn} />
          : <PostJobTab mySubmissions={mySubmissions} isLoggedIn={isLoggedIn} />}
      </div>
    </div>
  );
}
