"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Loader2, RotateCcw, GripHorizontal, Plus } from "lucide-react";
import { useMolstarPlugin, type ClickedResidue, type HighlightRegion } from "@/hooks/useMolstarPlugin";

interface MolstarViewerProps {
  pdbId?: string;
  pdbData?: string;
  highlightedChain?: string;
  highlightRegions?: HighlightRegion[];
  className?: string;
  height?: string;
  resizable?: boolean;
  onResidueClick?: (residue: ClickedResidue) => void;
}

export default function MolstarViewer({
  pdbId,
  pdbData,
  highlightedChain,
  highlightRegions,
  className = "",
  height = "h-80",
  resizable = false,
  onResidueClick,
}: MolstarViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const { plugin, loading, error, hoverLabel, clickedResidue } = useMolstarPlugin({
    containerRef,
    pdbId,
    pdbData,
    highlightedChain,
    highlightRegions,
  });

  const handleResetCamera = useCallback(() => {
    plugin?.canvas3d?.requestCameraReset();
  }, [plugin]);

  // Notify molstar of resize when drag height changes
  useEffect(() => {
    if (plugin) {
      const timer = setTimeout(() => plugin.handleResize(), 50);
      return () => clearTimeout(timer);
    }
  }, [dragHeight, plugin]);

  // Drag-to-resize handler
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = dragHeight ?? 320; // h-80 = 320px default

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientY - startY;
        const newHeight = Math.max(200, Math.min(800, startHeight + delta));
        setDragHeight(newHeight);
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [dragHeight]
  );

  const hasStructure = !!(pdbId || pdbData);

  const viewerStyle = dragHeight ? { height: `${dragHeight}px` } : undefined;
  const viewerClassName = `relative overflow-hidden rounded-lg ${dragHeight ? "" : height} ${className}`;

  const isFullHeight = height === "h-full";

  return (
    <div className={isFullHeight ? "h-full" : undefined}>
      <div className={viewerClassName} style={viewerStyle}>
        {/* Toolbar */}
        {hasStructure && (
          <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1">
            <button
              onClick={handleResetCamera}
              title="Reset camera"
              className="rounded-md bg-black/60 p-1.5 text-gray-400 backdrop-blur-sm hover:bg-black/80 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Molstar canvas container */}
        <div
          ref={containerRef}
          className="absolute inset-0 bg-[#10111a]"
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#10111a]/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-dayhoff-purple" />
              <span className="text-xs text-gray-400">Loading structure...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#10111a]/80">
            <div className="px-4 text-center">
              <p className="text-xs text-red-400">Failed to load structure</p>
              <p className="mt-1 text-[10px] text-gray-500">{error}</p>
            </div>
          </div>
        )}

        {/* Residue hover tooltip */}
        {hoverLabel && (
          <div className="pointer-events-none absolute left-2 top-2 z-20 max-w-[90%]">
            <div className="rounded-md border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-sm">
              <p
                className="text-xs font-medium text-white"
                dangerouslySetInnerHTML={{ __html: hoverLabel }}
              />
            </div>
          </div>
        )}

        {/* Clicked residue info bar */}
        {clickedResidue && onResidueClick && (
          <div className="absolute bottom-8 left-2 right-2 z-20">
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-sm">
              <span className="text-xs text-white">
                <span className="font-semibold">{clickedResidue.compId} {clickedResidue.seqId}</span>
                <span className="text-gray-400"> · Chain {clickedResidue.chainId}</span>
              </span>
              <button
                onClick={() => onResidueClick(clickedResidue)}
                className="ml-3 flex items-center gap-1 rounded bg-dayhoff-purple/80 px-2 py-1 text-[10px] font-semibold text-white hover:bg-dayhoff-purple"
              >
                <Plus className="h-3 w-3" />
                Add to Hotspots
              </button>
            </div>
          </div>
        )}

        {/* Interaction hint */}
        {hasStructure && !loading && !error && !hoverLabel && (
          <div className="pointer-events-none absolute bottom-2 left-2 z-10">
            <p className="rounded bg-black/50 px-2 py-1 text-[10px] text-gray-500 backdrop-blur-sm">
              Click residue to add hotspot &middot; Drag to rotate &middot; Scroll to
              zoom
            </p>
          </div>
        )}
      </div>

      {/* Drag-to-resize handle */}
      {resizable && (
        <div
          onMouseDown={handleResizeStart}
          className="group flex cursor-row-resize items-center justify-center py-1"
        >
          <div className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-0.5 transition-colors group-hover:bg-white/10">
            <GripHorizontal className="h-3 w-3 text-gray-600 group-hover:text-gray-400" />
            <span className="text-[10px] text-gray-600 group-hover:text-gray-400">
              Drag to resize
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
