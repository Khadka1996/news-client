"use client";

import { useState } from "react";
import { Play, Plus, Pencil, Trash2 } from "lucide-react";
import { mockVideos } from "@/data/media";

export default function ManageVideoPage() {
  const [videos, setVideos] = useState(mockVideos);

  function remove(id: string) {
    if (!confirm("यो भिडियो मेटाउने पक्का हो?")) return;
    setVideos((v) => v.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Manage Video</h1>
          <p className="text-sm text-neutral-500">भिडियो कन्टेन्ट अपलोड र व्यवस्थापन गर्नुहोस्</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-brand-dark text-white text-sm font-semibold px-4 py-2.5 hover:bg-brand-dark/90">
          <Plus size={16} /> Upload Video
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map((v) => (
          <div key={v.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="relative h-36 bg-neutral-100">
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <Play size={16} className="text-brand-dark ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] px-1.5 py-0.5 rounded">
                {v.duration}
              </span>
            </div>
            <div className="p-4">
              <span className="text-xs font-semibold text-brand-gold">{v.category}</span>
              <h3 className="font-semibold text-brand-dark text-sm mt-0.5 line-clamp-2">{v.title}</h3>
              <div className="flex items-center justify-between mt-3">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    v.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {v.status}
                </span>
                <span className="text-xs text-neutral-400">{v.views.toLocaleString()} views</span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
                <button className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-neutral-600 hover:text-brand-dark py-1.5">
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => remove(v.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold text-red-600 hover:underline py-1.5"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
