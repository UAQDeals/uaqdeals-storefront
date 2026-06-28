"use client";

import { useRef, useState } from "react";
import { X, Upload, CheckCircle, FileText, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Props {
  productId: string;
  vendorId: string | null;
  productName: string;
  userId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function PrescriptionUploadModal({
  productId, vendorId, productName, userId, onSuccess, onClose,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function submit() {
    if (!file) { toast.error("Please select a prescription file"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("prescriptions")
        .upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage
        .from("prescriptions")
        .getPublicUrl(path);
      const { error: dbErr } = await supabase.from("prescriptions").insert({
        customer_id: userId,
        product_id:  productId,
        vendor_id:   vendorId ?? null,
        image_url:   publicUrl,
        file_name:   file.name,
        file_size:   file.size,
        file_type:   file.type,
        status:      "pending",
      });
      if (dbErr) throw dbErr;
      toast.success("Prescription uploaded — you can now add this item to cart");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error("Upload failed: " + (e.message ?? "unknown error"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Upload Prescription</h2>
            <p className="mt-0.5 text-sm text-neutral-500 line-clamp-1">{productName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-neutral-100">
            <X className="h-4 w-4 text-neutral-600" />
          </button>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>This item requires a valid prescription. Our pharmacist will review your upload before fulfilling the order.</p>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          className="mb-4 cursor-pointer rounded-xl border-2 border-dashed border-[color:var(--brand-maroon)] p-6 text-center hover:bg-neutral-50 transition-colors"
        >
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm font-semibold text-green-700 truncate max-w-[260px]">{file.name}</p>
              <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(0)} KB · tap to change</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-[color:var(--brand-maroon)]" />
              <p className="text-sm font-semibold text-[color:var(--brand-maroon)]">Choose prescription file</p>
              <p className="text-xs text-neutral-500">JPG, PNG or PDF · max 10 MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span>Your prescription is stored securely and only shared with our licensed pharmacist.</span>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!file || uploading}
            className="flex-1 rounded-full bg-[color:var(--brand-maroon)] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Submit Prescription"}
          </button>
        </div>
      </div>
    </div>
  );
}
