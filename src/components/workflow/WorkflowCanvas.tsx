"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getModuleById } from "@/data/modules-catalog";
import { validateModuleConnection } from "@/lib/modules/module-metadata";
import { X, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

/* ── types ─────────────────────────────────────────────────────── */

export interface WorkflowModule {
  id: string;
  moduleId: string;
  name: string;
  category: string;
  position: { x: number; y: number };
  inputs: string[];
  outputs: string[];
  parameters?: Record<string, any>;
}

export interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
  dataType: string;
  validated?: boolean;
  learningAnnotation?: string;
}

interface Props {
  modules: WorkflowModule[];
  connections: WorkflowConnection[];
  selectedModuleId: string | null;
  onSelectModule: (id: string | null) => void;
  onMoveModule: (id: string, pos: { x: number; y: number }) => void;
  onConnect: (conn: WorkflowConnection) => void;
  onDeleteModule: (id: string) => void;
  onDeleteConnection: (id: string) => void;
}

/* ── constants ─────────────────────────────────────────────────── */

const NODE_W = 220;
const NODE_H = 96;
const PORT_R = 7;
const GRID_SIZE = 20;

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; port: string }> = {
  protein: { bg: "fill-purple-500/15", border: "stroke-purple-500/40", text: "text-purple-300", port: "#8b5cf6" },
  antibody: { bg: "fill-pink-500/15", border: "stroke-pink-500/40", text: "text-pink-300", port: "#ec4899" },
  interaction: { bg: "fill-blue-500/15", border: "stroke-blue-500/40", text: "text-blue-300", port: "#3b82f6" },
  assessment: { bg: "fill-emerald-500/15", border: "stroke-emerald-500/40", text: "text-emerald-300", port: "#34d399" },
};

/* ── helpers ────────────────────────────────────────────────────── */

function getInputPortPos(mod: WorkflowModule, portIdx: number, portCount: number) {
  const spacing = NODE_H / (portCount + 1);
  return { x: mod.position.x, y: mod.position.y + spacing * (portIdx + 1) };
}

function getOutputPortPos(mod: WorkflowModule, portIdx: number, portCount: number) {
  const spacing = NODE_H / (portCount + 1);
  return { x: mod.position.x + NODE_W, y: mod.position.y + spacing * (portIdx + 1) };
}

function curvedPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.abs(x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

/* ── annotation toast ──────────────────────────────────────────── */

interface Annotation {
  id: string;
  valid: boolean;
  message: string;
  learningNote: string;
}

function AnnotationToast({ ann, onClose }: { ann: Annotation; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`flex gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-sm ${
        ann.valid
          ? "border-dayhoff-emerald/30 bg-dayhoff-emerald/10"
          : "border-red-500/30 bg-red-500/10"
      }`}
    >
      {ann.valid ? (
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-dayhoff-emerald" />
      ) : (
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
      )}
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-semibold ${ann.valid ? "text-dayhoff-emerald" : "text-red-400"}`}>
          {ann.message}
        </div>
        {ann.learningNote && (
          <p className="mt-1 text-xs leading-relaxed text-gray-300">{ann.learningNote}</p>
        )}
      </div>
      <button onClick={onClose} className="shrink-0 text-gray-500 hover:text-white">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ── main component ────────────────────────────────────────────── */

export default function WorkflowCanvas({
  modules,
  connections,
  selectedModuleId,
  onSelectModule,
  onMoveModule,
  onConnect,
  onDeleteModule,
  onDeleteConnection,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  /* viewport transform */
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  /* drag state */
  const [dragging, setDragging] = useState<{
    id: string;
    startMouse: { x: number; y: number };
    startPos: { x: number; y: number };
  } | null>(null);

  /* panning */
  const [panning, setPanning] = useState<{ startMouse: { x: number; y: number }; startPan: { x: number; y: number } } | null>(null);

  /* connection drawing */
  const [drawing, setDrawing] = useState<{
    fromModuleId: string;
    fromPort: string;
    fromPos: { x: number; y: number };
    mousePos: { x: number; y: number };
  } | null>(null);

  /* annotations */
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  /* convert screen coords to canvas coords */
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: (screenX - rect.left - pan.x) / zoom,
        y: (screenY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  /* ── mouse handlers ──────────────────────────────────────────── */

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).classList.contains("grid-bg")) {
      onSelectModule(null);
      setPanning({
        startMouse: { x: e.clientX, y: e.clientY },
        startPan: { ...pan },
      });
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (panning) {
      setPan({
        x: panning.startPan.x + (e.clientX - panning.startMouse.x),
        y: panning.startPan.y + (e.clientY - panning.startMouse.y),
      });
    }
    if (dragging) {
      const canvas = screenToCanvas(e.clientX, e.clientY);
      const dx = canvas.x - screenToCanvas(dragging.startMouse.x, dragging.startMouse.y).x;
      const dy = canvas.y - screenToCanvas(dragging.startMouse.x, dragging.startMouse.y).y;
      const newX = Math.round((dragging.startPos.x + dx) / GRID_SIZE) * GRID_SIZE;
      const newY = Math.round((dragging.startPos.y + dy) / GRID_SIZE) * GRID_SIZE;
      onMoveModule(dragging.id, { x: newX, y: newY });
    }
    if (drawing) {
      const canvas = screenToCanvas(e.clientX, e.clientY);
      setDrawing((d) => (d ? { ...d, mousePos: canvas } : null));
    }
  };

  const handleSvgMouseUp = () => {
    setPanning(null);
    setDragging(null);
    if (drawing) {
      // check if mouse is over an input port
      const canvas = drawing.mousePos;
      for (const mod of modules) {
        if (mod.id === drawing.fromModuleId) continue;
        for (let pi = 0; pi < mod.inputs.length; pi++) {
          const pos = getInputPortPos(mod, pi, mod.inputs.length);
          const dist = Math.sqrt((canvas.x - pos.x) ** 2 + (canvas.y - pos.y) ** 2);
          if (dist < PORT_R * 3) {
            tryConnect(drawing.fromModuleId, drawing.fromPort, mod.id, mod.inputs[pi]);
            break;
          }
        }
      }
      setDrawing(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(2, Math.max(0.25, zoom * delta));
    // zoom toward cursor
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setPan({
      x: mx - ((mx - pan.x) / zoom) * newZoom,
      y: my - ((my - pan.y) / zoom) * newZoom,
    });
    setZoom(newZoom);
  };

  /* ── connection logic ────────────────────────────────────────── */

  const tryConnect = (fromModId: string, fromPort: string, toModId: string, toPort: string) => {
    const fromMod = modules.find((m) => m.id === fromModId);
    const toMod = modules.find((m) => m.id === toModId);
    if (!fromMod || !toMod) return;

    // avoid duplicates
    const exists = connections.some(
      (c) => c.from === fromModId && c.to === toModId && c.fromPort === fromPort && c.toPort === toPort
    );
    if (exists) return;

    const validation = validateModuleConnection(fromMod.moduleId, toMod.moduleId);
    const connId = `conn-${Date.now()}`;

    const ann: Annotation = {
      id: connId,
      valid: validation.valid,
      message: validation.message,
      learningNote: validation.learningNote,
    };
    setAnnotations((prev) => [...prev, ann]);

    if (validation.valid) {
      const fromModMeta = getModuleById(fromMod.moduleId);
      const toModMeta = getModuleById(toMod.moduleId);
      const compatFmts = fromModMeta?.outputFormats.filter((f) => toModMeta?.inputFormats.includes(f)) || [];
      onConnect({
        id: connId,
        from: fromModId,
        to: toModId,
        fromPort,
        toPort,
        dataType: compatFmts[0] || "unknown",
        validated: true,
        learningAnnotation: validation.learningNote,
      });
    }
  };

  /* ── render helpers ──────────────────────────────────────────── */

  const renderGrid = () => (
    <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
      <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r="0.5" fill="rgba(255,255,255,0.07)" />
    </pattern>
  );

  const renderConnections = () =>
    connections.map((conn) => {
      const fromMod = modules.find((m) => m.id === conn.from);
      const toMod = modules.find((m) => m.id === conn.to);
      if (!fromMod || !toMod) return null;
      const fromPortIdx = fromMod.outputs.indexOf(conn.fromPort);
      const toPortIdx = toMod.inputs.indexOf(conn.toPort);
      if (fromPortIdx < 0 || toPortIdx < 0) return null;
      const p1 = getOutputPortPos(fromMod, fromPortIdx, fromMod.outputs.length);
      const p2 = getInputPortPos(toMod, toPortIdx, toMod.inputs.length);
      const colors = CATEGORY_COLORS[fromMod.category] || CATEGORY_COLORS.protein;
      return (
        <g key={conn.id}>
          <path
            d={curvedPath(p1.x, p1.y, p2.x, p2.y)}
            fill="none"
            stroke={colors.port}
            strokeWidth={2}
            strokeOpacity={0.6}
            className="transition-all"
          />
          {/* clickable hit area */}
          <path
            d={curvedPath(p1.x, p1.y, p2.x, p2.y)}
            fill="none"
            stroke="transparent"
            strokeWidth={12}
            className="cursor-pointer"
            onClick={() => onDeleteConnection(conn.id)}
          />
          {/* data type tag */}
          {(() => {
            const tagW = 38;
            const tagH = 16;
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2 - 10;
            return (
              <g style={{ pointerEvents: "none" }}>
                <rect
                  x={cx - tagW / 2}
                  y={cy - tagH / 2}
                  width={tagW}
                  height={tagH}
                  rx={4}
                  fill="rgba(15,16,22,0.85)"
                  stroke={colors.port}
                  strokeWidth={0.75}
                  strokeOpacity={0.5}
                />
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fill={colors.port}
                  className="text-[9px] font-semibold uppercase"
                >
                  {conn.dataType}
                </text>
              </g>
            );
          })()}
        </g>
      );
    });

  const renderDrawingLine = () => {
    if (!drawing) return null;
    return (
      <path
        d={curvedPath(drawing.fromPos.x, drawing.fromPos.y, drawing.mousePos.x, drawing.mousePos.y)}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth={2}
        strokeDasharray="6 3"
        strokeOpacity={0.7}
      />
    );
  };

  const renderNodes = () =>
    modules.map((mod) => {
      const colors = CATEGORY_COLORS[mod.category] || CATEGORY_COLORS.protein;
      const isSelected = mod.id === selectedModuleId;
      const meta = getModuleById(mod.moduleId);

      return (
        <g key={mod.id}>
          {/* node body */}
          <rect
            x={mod.position.x}
            y={mod.position.y}
            width={NODE_W}
            height={NODE_H}
            rx={12}
            className={`${colors.bg} ${isSelected ? "stroke-dayhoff-purple stroke-2" : colors.border} cursor-grab transition-all`}
            strokeWidth={isSelected ? 2 : 1}
            onMouseDown={(e) => {
              e.stopPropagation();
              onSelectModule(mod.id);
              setDragging({
                id: mod.id,
                startMouse: { x: e.clientX, y: e.clientY },
                startPos: { ...mod.position },
              });
            }}
          />

          {/* module name */}
          <text
            x={mod.position.x + NODE_W / 2}
            y={mod.position.y + 30}
            textAnchor="middle"
            className="fill-white text-[13px] font-semibold"
            style={{ pointerEvents: "none" }}
          >
            {mod.name}
          </text>

          {/* category label */}
          <text
            x={mod.position.x + NODE_W / 2}
            y={mod.position.y + 48}
            textAnchor="middle"
            className="fill-gray-500 text-[10px] capitalize"
            style={{ pointerEvents: "none" }}
          >
            {mod.category}
          </text>

          {/* I/O format tags */}
          {meta && (() => {
            const allTags = [
              ...meta.inputFormats.map((f) => ({ label: f, kind: "in" as const })),
              ...meta.outputFormats.map((f) => ({ label: f, kind: "out" as const })),
            ];
            const tagW = 36;
            const tagH = 14;
            const tagGap = 4;
            const totalW = allTags.length * tagW + (allTags.length - 1) * tagGap;
            const startX = mod.position.x + (NODE_W - totalW) / 2;
            const tagY = mod.position.y + 62;

            return allTags.map((tag, ti) => (
              <g key={`tag-${ti}`} style={{ pointerEvents: "none" }}>
                <rect
                  x={startX + ti * (tagW + tagGap)}
                  y={tagY}
                  width={tagW}
                  height={tagH}
                  rx={4}
                  fill={tag.kind === "in" ? "rgba(59,130,246,0.15)" : "rgba(16,185,129,0.15)"}
                  stroke={tag.kind === "in" ? "rgba(59,130,246,0.3)" : "rgba(16,185,129,0.3)"}
                  strokeWidth={0.5}
                />
                <text
                  x={startX + ti * (tagW + tagGap) + tagW / 2}
                  y={tagY + tagH / 2 + 3}
                  textAnchor="middle"
                  fill={tag.kind === "in" ? "#60a5fa" : "#34d399"}
                  className="text-[8px] font-semibold uppercase"
                >
                  {tag.label}
                </text>
              </g>
            ));
          })()}

          {/* input ports (left side) */}
          {mod.inputs.map((port, pi) => {
            const pos = getInputPortPos(mod, pi, mod.inputs.length);
            return (
              <g key={`in-${pi}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={PORT_R}
                  fill="#1a1b23"
                  stroke={colors.port}
                  strokeWidth={2}
                  className="cursor-crosshair transition-all hover:fill-white/20"
                  onMouseUp={() => {
                    if (drawing && drawing.fromModuleId !== mod.id) {
                      tryConnect(drawing.fromModuleId, drawing.fromPort, mod.id, port);
                      setDrawing(null);
                    }
                  }}
                />
                <text
                  x={pos.x + PORT_R + 5}
                  y={pos.y + 3}
                  className="text-[8px] font-medium uppercase"
                  fill="#60a5fa"
                  style={{ pointerEvents: "none" }}
                >
                  {port}
                </text>
              </g>
            );
          })}

          {/* output ports (right side) */}
          {mod.outputs.map((port, pi) => {
            const pos = getOutputPortPos(mod, pi, mod.outputs.length);
            return (
              <g key={`out-${pi}`}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={PORT_R}
                  fill="#1a1b23"
                  stroke={colors.port}
                  strokeWidth={2}
                  className="cursor-crosshair transition-all hover:fill-white/20"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDrawing({
                      fromModuleId: mod.id,
                      fromPort: port,
                      fromPos: pos,
                      mousePos: pos,
                    });
                  }}
                />
                <text
                  x={pos.x - PORT_R - 5}
                  y={pos.y + 3}
                  textAnchor="end"
                  className="text-[8px] font-medium uppercase"
                  fill="#34d399"
                  style={{ pointerEvents: "none" }}
                >
                  {port}
                </text>
              </g>
            );
          })}

          {/* delete button (visible when selected) */}
          {isSelected && (
            <g
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteModule(mod.id);
              }}
            >
              <circle
                cx={mod.position.x + NODE_W - 4}
                cy={mod.position.y + 4}
                r={10}
                fill="#ef4444"
                fillOpacity={0.8}
              />
              <text
                x={mod.position.x + NODE_W - 4}
                y={mod.position.y + 8}
                textAnchor="middle"
                className="fill-white text-[11px] font-bold"
                style={{ pointerEvents: "none" }}
              >
                ×
              </text>
            </g>
          )}
        </g>
      );
    });

  return (
    <div className="relative h-full w-full overflow-hidden bg-dayhoff-bg-primary">
      {/* Annotations overlay */}
      {annotations.length > 0 && (
        <div className="absolute bottom-4 left-4 z-20 flex max-w-md flex-col gap-2">
          {annotations.map((ann) => (
            <AnnotationToast key={ann.id} ann={ann} onClose={() => removeAnnotation(ann.id)} />
          ))}
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(2, z * 1.2))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-dayhoff-bg-secondary text-sm text-white hover:bg-white/10"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.25, z * 0.8))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-dayhoff-bg-secondary text-sm text-white hover:bg-white/10"
        >
          -
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-dayhoff-bg-secondary text-[10px] text-gray-400 hover:bg-white/10"
        >
          1:1
        </button>
      </div>

      {/* Empty state */}
      {modules.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-500">Drop modules here to build your workflow</p>
            <p className="mt-1 text-sm text-gray-600">
              Click a module in the palette to add it to the canvas
            </p>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        className="h-full w-full"
        onMouseDown={handleSvgMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
        onWheel={handleWheel}
      >
        <defs>{renderGrid()}</defs>
        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
          <rect
            x={-5000}
            y={-5000}
            width={10000}
            height={10000}
            fill="url(#grid)"
            className="grid-bg"
          />
          {renderConnections()}
          {renderDrawingLine()}
          {renderNodes()}
        </g>
      </svg>
    </div>
  );
}
