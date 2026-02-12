"use client";

import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { useMolstarPlugin } from "@/hooks/useMolstarPlugin";

interface MolstarViewerProps {
  pdbId?: string;
  pdbData?: string;
  className?: string;
  height?: string;
}

export default function MolstarViewer({
  pdbId,
  pdbData,
  className = "",
  height = "h-64",
}: MolstarViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { loading, error } = useMolstarPlugin({ containerRef, pdbId, pdbData });

  return (
    <div className={`relative overflow-hidden rounded-lg ${height} ${className}`}>
      {/* Molstar canvas container */}
      <div
        ref={containerRef}
        className="absolute inset-0 bg-[#0a0b0f]"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0b0f]/80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-dayhoff-purple" />
            <span className="text-xs text-gray-400">Loading structure...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0b0f]/80">
          <div className="px-4 text-center">
            <p className="text-xs text-red-400">Failed to load structure</p>
            <p className="mt-1 text-[10px] text-gray-500">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
