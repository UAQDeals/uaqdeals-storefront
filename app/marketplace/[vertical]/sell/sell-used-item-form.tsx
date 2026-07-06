"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const CATEGORIES = ["Phones & Accessories", "Tablets", "Laptops", "TV", "Refrigerator", "Washing Machine", "AC"];
const CONDITIONS = ["New", "Like New", "Good", "Fair"];

const CATEGORY_LABELS_AR: Record<string, string> = {
  "Phones & Accessories": "الهواتف والإكسسوارات",
  "Tablets": "الأجهزة اللوحية",
  "Laptops": "أجهزة الكمبيوتر المحمولة",
  "TV": "التلفزيونات",
  "Refrigerator": "الثلاجات",
  "Washing Machine": "الغسالات",
  "AC": "المكيفات",
};
const CONDITION_LABELS_AR: Record<string, string> = {
  "New": "جديد",
  "Like New": "شبه جديد",
  "Good": "جيد",
  "Fair": "مقبول",
};

export function SellUsedItemForm({ userId }: { userId: string }) {
  const router = useRouter();
  const isRTL = useLocale() === "ar";
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [condition, setCondition] = useState("Good");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  function addImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setImages((prev) => [...prev, ...files]);
    e.target.value = "";
  }
  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function uploadToStorage(file: File, prefix: string): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await supabase.storage.from("property-images").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("property-images").getPublicUrl(path).data.publicUrl;
  }

  async function submit() {
    if (!title.trim()) { toast.error(isRTL ? "العنوان مطلوب" : "Title is required"); return; }
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) { toast.error(isRTL ? "السعر مطلوب" : "Price is required"); return; }
    setUploading(true);
    try {
      const imageUrls: string[] = [];
      for (const img of images) {
        imageUrls.push(await uploadToStorage(img, "used-items"));
      }
      let videoUrl: string | null = null;
      if (video) {
        videoUrl = await uploadToStorage(video, "used-items-videos");
      }
      // Ensure a profiles row exists for this user (trigger downstream needs it)
      await supabase.from("profiles").upsert(
        { id: userId, email: (await supabase.auth.getUser()).data.user?.email ?? null },
        { onConflict: "id", ignoreDuplicates: false }
      );

      const { error } = await supabase.from("used_items_submissions").insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        price: p,
        category,
        condition,
        is_negotiable: negotiable,
        images: imageUrls.length > 0 ? imageUrls : null,
        video_url: videoUrl,
        image_count: imageUrls.length,
        video_count: videoUrl ? 1 : 0,
        status: "pending",
      });
      if (error) throw error;
      toast.success(isRTL ? "تم إرسال العنصر للمراجعة!" : "Item submitted for review!");
      router.push("/marketplace/used_items");
    } catch (e: any) {
      toast.error(e.message ?? (isRTL ? "تعذّر الإرسال" : "Could not submit"));
      setUploading(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#8E1B3A] focus:ring-1 focus:ring-[#8E1B3A]";
  const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-600";

  if (uploading) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-[#8E1B3A]" />
        <p className="mt-3 text-sm text-neutral-500">{isRTL ? "جارٍ رفع إعلانك…" : "Uploading your listing…"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>{isRTL ? "العنوان *" : "Title *"}</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={isRTL ? "مثال: آيفون 13، تلفزيون سامسونج 55 بوصة، ماك بوك إير M2..." : "e.g. iPhone 13, Samsung 55 inch TV, MacBook Air M2..."} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{isRTL ? "الفئة *" : "Category *"}</label>
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{isRTL ? CATEGORY_LABELS_AR[c] ?? c : c}</option>))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{isRTL ? "الحالة *" : "Condition *"}</label>
          <select className={inputCls} value={condition} onChange={(e) => setCondition(e.target.value)}>
            {CONDITIONS.map((c) => (<option key={c} value={c}>{isRTL ? CONDITION_LABELS_AR[c] ?? c : c}</option>))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{isRTL ? "السعر (درهم) *" : "Price (AED) *"}</label>
          <input className={inputCls} type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="250" />
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="h-4 w-4 accent-[#8E1B3A]" />
            <span className="font-semibold text-neutral-700">{isRTL ? "قابل للتفاوض" : "Negotiable"}</span>
          </label>
        </div>
      </div>

      <div>
        <label className={labelCls}>{isRTL ? "الوصف" : "Description"}</label>
        <textarea className={inputCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={isRTL ? "صِف العنصر الخاص بك..." : "Describe your item..."} />
      </div>

      <div>
        <label className={labelCls}>{isRTL ? `الصور (${images.length})` : `Photos (${images.length})`}</label>
        {images.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.map((f, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute end-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                >×</button>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#8E1B3A] px-4 py-2 text-sm font-semibold text-[#8E1B3A]">
          <input type="file" accept="image/*" multiple onChange={addImages} className="hidden" />
          {isRTL ? "+ إضافة صور" : "+ Add Photos"}
        </label>
      </div>

      <div>
        <label className={labelCls}>{isRTL ? "فيديو (اختياري)" : "Video (optional)"}</label>
        {video && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm">
            <span className="flex-1 truncate">🎥 {video.name}</span>
            <button type="button" onClick={() => setVideo(null)} className="text-red-500">×</button>
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#8E1B3A] px-4 py-2 text-sm font-semibold text-[#8E1B3A]">
          <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} className="hidden" />
          {video ? (isRTL ? "تغيير الفيديو" : "Change Video") : (isRTL ? "+ إضافة فيديو" : "+ Add Video")}
        </label>
      </div>

      <button
        onClick={submit}
        className="w-full rounded-lg bg-gradient-to-r from-[#8E1B3A] to-[#C72931] py-3 text-sm font-bold text-white"
      >
        {isRTL ? "إرسال للمراجعة" : "Submit for Review"}
      </button>
    </div>
  );
}
