"use client";

import { useState } from "react";

const toggles = [
  { key: "newArticleAlerts", label: "नयाँ समाचार पेश हुँदा सूचना दिनुहोस्" },
  { key: "commentReports", label: "टिप्पणी रिपोर्ट हुँदा सूचना दिनुहोस्" },
  { key: "weeklyDigest", label: "साप्ताहिक analytics डाइजेस्ट इमेल गर्नुहोस्" },
  { key: "twoFactor", label: "टु-फ्याक्टर अथेन्टिकेसन सक्षम गर्नुहोस्" },
];

export default function AdminSettingsPage() {
  const [state, setState] = useState<Record<string, boolean>>({
    newArticleAlerts: true,
    commentReports: true,
    weeklyDigest: false,
    twoFactor: false,
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-brand-dark mb-1">Settings</h1>
      <p className="text-sm text-neutral-500 mb-6">सूचना र सुरक्षा प्राथमिकताहरू व्यवस्थापन गर्नुहोस्</p>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm divide-y divide-neutral-100">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-neutral-700">{t.label}</span>
            <button
              onClick={() => setState((s) => ({ ...s, [t.key]: !s[t.key] }))}
              className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                state[t.key] ? "bg-brand-gold" : "bg-neutral-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  state[t.key] ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
