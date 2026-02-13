"use client";

import { ExternalLink } from "lucide-react";
import type { CaseStudy } from "@/data/module-case-studies";

interface CaseStudyCardProps {
  study: CaseStudy;
  onView?: () => void;
}

export default function CaseStudyCard({ study, onView }: CaseStudyCardProps) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/5 p-5"
      onClick={onView}
    >
      <a
        href={study.doi}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2 text-sm font-semibold text-white hover:text-dayhoff-purple"
        onClick={(e) => e.stopPropagation()}
      >
        {study.paperTitle}
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" />
      </a>

      <div className="mt-1 text-xs text-gray-500">
        {study.authors} ({study.year}) &middot; {study.journal}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-300">
        {study.summary}
      </p>

      <div className="mt-3 rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 px-4 py-2.5">
        <p className="text-xs font-semibold text-dayhoff-emerald">
          Key Takeaway
        </p>
        <p className="mt-0.5 text-sm text-gray-300">{study.keyTakeaway}</p>
      </div>
    </div>
  );
}
