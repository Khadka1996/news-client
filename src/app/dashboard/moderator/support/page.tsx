"use client";

import { useState } from "react";
import { LifeBuoy, Mail } from "lucide-react";

const faqs = [
  { q: "समाचार कसरी स्वीकृत/अस्वीकार गर्ने?", a: "Dashboard मा पेन्डिङ समाचारको Review बटन थिचेर पूरा समाचार हेरी प्रकाशित वा अस्वीकार गर्न सकिन्छ।" },
  { q: "मैले अस्वीकार गरेको समाचार फेरि पेन्डिङमा आउँछ?", a: "होइन, लेखकले पुनः सम्पादन गरेर पेश गरेमात्र फेरि पेन्डिङमा देखिन्छ।" },
];

export default function ModeratorSupportPage() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-brand-dark mb-1">Support</h1>
      <p className="text-sm text-neutral-500 mb-6">मद्दत चाहिन्छ? यहाँबाट सम्पर्क गर्नुहोस्।</p>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 mb-6">
        <h2 className="font-bold text-brand-dark mb-3 text-sm flex items-center gap-2">
          <LifeBuoy size={16} className="text-brand-gold" /> बारम्बार सोधिने प्रश्नहरू
        </h2>
        <div className="divide-y divide-neutral-100">
          {faqs.map((f) => (
            <details key={f.q} className="py-3 group">
              <summary className="text-sm font-medium text-neutral-800 cursor-pointer list-none flex items-center justify-between">
                {f.q}
                <span className="text-neutral-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-neutral-500 mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5">
        <h2 className="font-bold text-brand-dark mb-3 text-sm flex items-center gap-2">
          <Mail size={16} className="text-brand-gold" /> एड्मिनलाई सन्देश पठाउनुहोस्
        </h2>
        {sent ? (
          <p className="text-sm text-emerald-600">सन्देश पठाइयो — हामी चाँडै जवाफ दिनेछौं।</p>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="तपाईंको समस्या वर्णन गर्नुहोस्..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <button
              onClick={() => message.trim() && setSent(true)}
              className="mt-3 rounded-lg bg-brand-dark text-white text-sm font-semibold px-5 py-2.5 hover:bg-brand-dark/90"
            >
              पठाउनुहोस्
            </button>
          </>
        )}
      </div>
    </div>
  );
}
