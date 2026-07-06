"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronLeft, Plane, PlaneTakeoff, PlaneLanding, User, Phone, Mail, FileText, Minus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function Counter({ label, value, set, min, max }: { label: string; value: number; set: (v: number) => void; min: number; max: number; }) {
  return (
    <div className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 flex items-center justify-between">
      <div>
        <p className="text-[10px] text-neutral-500">{label}</p>
        <p className="text-base font-extrabold">{value}</p>
      </div>
      <div className="flex flex-col gap-1">
        <button type="button" disabled={value >= max} onClick={() => set(value + 1)} className="p-1 rounded-md bg-neutral-100 disabled:opacity-30">
          <Plus className="w-3.5 h-3.5 text-[#8E1B3A]" />
        </button>
        <button type="button" disabled={value <= min} onClick={() => set(value - 1)} className="p-1 rounded-md bg-neutral-100 disabled:opacity-30">
          <Minus className="w-3.5 h-3.5 text-[#8E1B3A]" />
        </button>
      </div>
    </div>
  );
}

export function FlightBookingForm() {
  const router = useRouter();
  const supabase = createClient();
  const isRTL = useLocale() === "ar";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [notes, setNotes] = useState("");
  const [tripType, setTripType] = useState("Round Trip");
  const [classType, setClassType] = useState("Economy");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [loading, setLoading] = useState(false);

  const tripTypeLabels: Record<string, string> = {
    "One Way": isRTL ? "ذهاب فقط" : "One Way",
    "Round Trip": isRTL ? "ذهاب وعودة" : "Round Trip",
    "Multi City": isRTL ? "وجهات متعددة" : "Multi City",
  };
  const classTypeLabels: Record<string, string> = {
    "Economy": isRTL ? "اقتصادية" : "Economy",
    "Business": isRTL ? "رجال الأعمال" : "Business",
    "First": isRTL ? "الأولى" : "First",
  };

  async function submit() {
    if (!name || !phone || !from || !to) { toast.error(isRTL ? "يرجى إدخال الاسم والهاتف ومن وإلى" : "Please fill name, phone, from and to"); return; }
    if (!departDate) { toast.error(isRTL ? "يرجى اختيار تاريخ المغادرة" : "Please select departure date"); return; }
    if (tripType === "Round Trip" && !returnDate) { toast.error(isRTL ? "يرجى اختيار تاريخ العودة" : "Please select return date"); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const details = `Trip: ${tripType} | Class: ${classType} | From: ${from} | To: ${to} | Depart: ${departDate}${returnDate ? ` | Return: ${returnDate}` : ""} | Adults: ${adults} | Children: ${children} | Email: ${email}${notes ? ` | Notes: ${notes}` : ""}`;
      const { error } = await supabase.from("service_enquiries").insert({
        user_id: user?.id ?? null, service_id: "flight_booking", service_title: "Flight Booking Enquiry",
        name, phone, message: details, status: "open",
      });
      if (error) throw error;
      toast.success(isRTL ? "تم إرسال طلب الرحلة! سيتواصل معك فريقنا بأفضل الخيارات." : "Flight enquiry submitted! Our team will contact you with the best options.");
      router.push("/services");
    } catch (e: any) {
      toast.error((isRTL ? "خطأ: " : "Error: ") + (e.message ?? (isRTL ? "تعذر الإرسال" : "Could not submit")));
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg bg-neutral-100">
            <ChevronLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <h1 className="text-[17px] font-bold text-neutral-900">{isRTL ? "حجز الطيران" : "Flight Booking"}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-5 space-y-5">
        <div className="rounded-2xl p-4 flex items-center gap-3 text-white" style={{ background: "linear-gradient(135deg, #01579B, #0277BD)" }}>
          <PlaneTakeoff className="w-7 h-7" />
          <div>
            <p className="text-[16px] font-extrabold">{isRTL ? "احجز رحلتك" : "Book Your Flight"}</p>
            <p className="text-[11px] text-white/70">{isRTL ? "سنجد لك أفضل العروض" : "We will find the best deals for you"}</p>
          </div>
        </div>

        <div>
          <label className="text-[13px] font-bold text-neutral-800">{isRTL ? "نوع الرحلة" : "Trip Type"}</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {["One Way", "Round Trip", "Multi City"].map((tp) => (
              <button key={tp} type="button" onClick={() => setTripType(tp)}
                className={"py-3 rounded-lg border text-[11px] font-bold transition " + (tripType === tp ? "bg-[#8E1B3A] text-white border-[#8E1B3A]" : "bg-white text-neutral-700 border-neutral-300")}>
                {tripTypeLabels[tp]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[13px] font-bold text-neutral-800">{isRTL ? "المسار" : "Route"}</label>
          <div className="space-y-3 mt-2">
            <Field icon={PlaneTakeoff} placeholder={isRTL ? "من (المدينة / المطار)" : "From (City / Airport)"} value={from} onChange={setFrom} />
            <Field icon={PlaneLanding} placeholder={isRTL ? "إلى (المدينة / المطار)" : "To (City / Airport)"} value={to} onChange={setTo} />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-bold text-neutral-800">{isRTL ? "تواريخ السفر" : "Travel Dates"}</label>
          <div className={"grid gap-3 mt-2 " + (tripType === "Round Trip" ? "grid-cols-2" : "grid-cols-1")}>
            <div className="rounded-xl border border-neutral-300 bg-white px-3 py-2">
              <p className="text-[10px] text-neutral-500">{isRTL ? "المغادرة" : "Departure"}</p>
              <input type="date" min={today} value={departDate} onChange={(e) => setDepartDate(e.target.value)}
                className="w-full text-[13px] font-semibold focus:outline-none bg-transparent" />
            </div>
            {tripType === "Round Trip" && (
              <div className="rounded-xl border border-neutral-300 bg-white px-3 py-2">
                <p className="text-[10px] text-neutral-500">{isRTL ? "العودة" : "Return"}</p>
                <input type="date" min={departDate || today} value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full text-[13px] font-semibold focus:outline-none bg-transparent" />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-[13px] font-bold text-neutral-800">{isRTL ? "المسافرون" : "Passengers"}</label>
          <div className="flex gap-3 mt-2">
            <Counter label={isRTL ? "بالغون" : "Adults"} value={adults} set={setAdults} min={1} max={9} />
            <Counter label={isRTL ? "أطفال" : "Children"} value={children} set={setChildren} min={0} max={9} />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-bold text-neutral-800">{isRTL ? "درجة السفر" : "Travel Class"}</label>
          <div className="flex gap-2 mt-2">
            {["Economy", "Business", "First"].map((c) => (
              <button key={c} type="button" onClick={() => setClassType(c)}
                className={"px-5 py-2.5 rounded-lg border text-[12px] font-semibold transition " + (classType === c ? "bg-[#8E1B3A] text-white border-[#8E1B3A]" : "bg-white text-neutral-700 border-neutral-300")}>
                {classTypeLabels[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[13px] font-bold text-neutral-800">{isRTL ? "بيانات التواصل" : "Contact Details"}</label>
          <Field icon={User} placeholder={isRTL ? "الاسم الكامل" : "Full Name"} value={name} onChange={setName} />
          <Field icon={Phone} placeholder={isRTL ? "الهاتف" : "Phone"} value={phone} onChange={setPhone} type="tel" />
          <Field icon={Mail} placeholder={isRTL ? "البريد الإلكتروني" : "Email"} value={email} onChange={setEmail} type="email" />
          <div className="relative">
            <FileText className="absolute start-3 top-3.5 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={isRTL ? "متطلبات خاصة" : "Special Requirements"} rows={3}
              className="w-full rounded-xl border border-neutral-300 ps-10 pe-4 py-3 text-sm focus:outline-none focus:border-[#8E1B3A]" />
          </div>
        </div>

        <button onClick={submit} disabled={loading}
          className="w-full rounded-2xl text-white font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "#01579B", height: 52 }}>
          {loading ? (isRTL ? "جاري الإرسال..." : "Submitting...") : <><Plane className="w-5 h-5" /> {isRTL ? "إرسال الطلب" : "Submit Enquiry"}</>}
        </button>
        <p className="text-center text-[11px] text-neutral-500">{isRTL ? "سيرد مكتب السفر لدينا خلال ساعتين" : "Our travel desk will respond within 2 hours"}</p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange, type = "text" }: { icon: any; placeholder: string; value: string; onChange: (v: string) => void; type?: string; }) {
  return (
    <div className="relative">
      <Icon className="absolute start-3 top-1/2 -translate-y-1/2 text-[#8E1B3A]" style={{ width: 18, height: 18 }} />
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-12 rounded-xl border border-neutral-300 ps-10 pe-4 text-sm focus:outline-none focus:border-[#8E1B3A]" />
    </div>
  );
}
