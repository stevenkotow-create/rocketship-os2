"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { FRAMEWORKS } from "@/lib/data/frameworks";

export default function FlightManual() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <PageHero
        eyebrow="Reference"
        title="Flight Manual"
        subtitle={<>Strategic depth layer. The frameworks you reference in the moment. <strong className="text-accent">{FRAMEWORKS.length} frameworks indexed</strong> · click any to expand.</>}
        marker="FM.01"
      />

      <div className="space-y-2">
        {FRAMEWORKS.map((f) => (
          <div key={f.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:border-border-strong transition-colors">
            <button
              onClick={() => setOpen(open === f.id ? null : f.id)}
              className="flex justify-between items-center w-full p-5 cursor-pointer hover:bg-surface-2 text-left transition-colors"
            >
              <div className="font-semibold text-[15px] text-navy">{f.title}</div>
              <span className={`text-muted text-[12px] transition-transform duration-200 ${open === f.id ? "rotate-90" : ""}`}>▶</span>
            </button>
            {open === f.id && (
              <div
                className="px-5 pb-5 text-[13px] text-text-dim leading-[1.65] [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_h4]:text-[13px] [&_h4]:font-semibold [&_h4]:text-navy [&_h4]:mt-4 [&_h4]:mb-2 [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px] [&_strong]:text-navy"
                dangerouslySetInnerHTML={{ __html: f.body }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
