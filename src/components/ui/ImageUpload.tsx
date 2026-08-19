"use client";

import { useRef, useState } from "react";
import { ImagePlus, UploadCloud, X } from "lucide-react";

type ImageUploadProps = {
  value?: string;
  uploading?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
};

export function ImageUpload({ value, uploading = false, onUpload, onRemove }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFile = (file?: File) => {
    if (file) onUpload(file);
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">Author photo</label>
      {value ? (
        <div className="relative h-48 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
          <img src={value} alt="Uploaded author photo" className="h-full w-full object-contain" />
          <button type="button" onClick={onRemove} disabled={uploading} aria-label="Remove uploaded image" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-md hover:bg-red-50 disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files?.[0]); }} className={`flex h-48 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${dragging ? "border-brand-gold bg-amber-50" : "border-neutral-300 bg-white hover:border-brand-gold hover:bg-amber-50/40"}`}>
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"><UploadCloud className="h-5 w-5" /></span>
          <span className="text-sm font-medium text-neutral-700">Drag &amp; drop image here</span>
          <span className="my-1 text-xs text-neutral-400">Or</span>
          <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-950 px-4 py-2 text-xs font-semibold text-white"><ImagePlus className="h-3.5 w-3.5" />{uploading ? "Uploading..." : "Upload Image"}</span>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => acceptFile(event.target.files?.[0])} />
        </button>
      )}
    </div>
  );
}
