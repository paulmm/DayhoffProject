"use client";

import { motion } from "framer-motion";
import {
  ChevronRight,
  Info,
  BarChart3,
  BookOpen,
  AlertTriangle,
  Box,
  ExternalLink,
} from "lucide-react";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
} from "@/hooks/useWorkspaceReducer";
import {
  WORKSPACE_EVIDENCE,
  type EvidenceItem,
} from "@/data/workspace-evidence";

const ICON_MAP: Record<EvidenceItem["type"], React.ComponentType<{ className?: string }>> = {
  info: Info,
  metric: BarChart3,
  citation: BookOpen,
  warning: AlertTriangle,
  structure: Box,
  literature: BookOpen,
};

const COLOR_MAP: Record<EvidenceItem["type"], string> = {
  info: "border-white/10 bg-white/5",
  metric: "border-dayhoff-purple/20 bg-dayhoff-purple/5",
  citation: "border-dayhoff-emerald/20 bg-dayhoff-emerald/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  structure: "border-cyan-500/20 bg-cyan-500/5",
  literature: "border-white/10 bg-white/[0.03]",
};

const ICON_COLOR_MAP: Record<EvidenceItem["type"], string> = {
  info: "text-gray-400",
  metric: "text-dayhoff-purple",
  citation: "text-dayhoff-emerald",
  warning: "text-amber-500",
  structure: "text-cyan-400",
  literature: "text-gray-500",
};

const HIGHLIGHT_COLOR_MAP: Record<string, string> = {
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  purple: "bg-dayhoff-purple/10 text-dayhoff-purple border-dayhoff-purple/20",
};

export default function EvidencePanel() {
  const { currentStep } = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();

  const evidence = WORKSPACE_EVIDENCE[currentStep];

  let itemIndex = 0;

  return (
    <div className="flex h-full w-[400px] min-w-0 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h3 className="text-sm font-semibold text-white">
          Evidence & Insights
        </h3>
        <button
          onClick={() => dispatch({ type: "TOGGLE_EVIDENCE_PANEL" })}
          className="rounded-md p-1 text-gray-400 hover:bg-white/5 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {evidence && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {evidence.heading}
              </h4>
              {evidence.description && (
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                  {evidence.description}
                </p>
              )}
            </div>

            {evidence.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                  {section.heading}
                </p>

                {section.items.map((item) => {
                  const Icon = ICON_MAP[item.type];
                  const delay = itemIndex * 0.06;
                  itemIndex += 1;

                  return (
                    <motion.div
                      key={`${sIdx}-${itemIndex}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay, duration: 0.2 }}
                      className={`rounded-lg border p-3 ${COLOR_MAP[item.type]}`}
                    >
                      {/* Title row */}
                      <div className="flex items-start gap-2">
                        <Icon
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${ICON_COLOR_MAP[item.type]}`}
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white">
                            {item.title}
                          </span>
                          {item.subtitle && (
                            <span className="ml-1.5 text-[10px] text-gray-500">
                              {item.subtitle}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Highlight badge */}
                      {item.highlight && (
                        <div
                          className={`mt-2 inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                            HIGHLIGHT_COLOR_MAP[item.highlightColor || "purple"]
                          }`}
                        >
                          {item.highlight}
                        </div>
                      )}

                      {/* Content */}
                      <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
                        {item.content}
                      </p>

                      {/* Link */}
                      {item.link && (
                        <a
                          href={item.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-dayhoff-purple hover:text-dayhoff-purple/80"
                        >
                          {item.link.text}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
