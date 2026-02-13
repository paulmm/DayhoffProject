"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ModuleMetadata, getModuleById, MODULE_CATALOG } from "@/data/modules-catalog";
import { validateModuleConnection, getCompatibleModules } from "@/lib/modules/module-metadata";
import { useCustomWorkflows } from "@/hooks/useCustomWorkflows";
import WorkflowCanvas, {
  type WorkflowModule,
  type WorkflowConnection,
} from "@/components/workflow/WorkflowCanvas";
import ModulePalette from "@/components/workflow/ModulePalette";
import AIWorkflowComposer, { type ComposeResult } from "@/components/workflow/AIWorkflowComposer";
import AIResultOverlay from "@/components/workflow/AIResultOverlay";
import BuilderChat from "@/components/workflow/BuilderChat";
import {
  Save,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Trash2,
  Brain,
  Hand,
  Plus,
} from "lucide-react";

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const { saveWorkflow } = useCustomWorkflows();

  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState<WorkflowModule[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [composeResult, setComposeResult] = useState<ComposeResult | null>(null);
  const searchParams = useSearchParams();

  /* ── load template from URL param ──────────────────────────── */

  useEffect(() => {
    const template = searchParams.get("template");
    if (template !== "antibody-design" || modules.length > 0) return;

    const moduleIds = ["rfdiffusion", "proteinmpnn", "esmfold"];
    const now = Date.now();

    const templateModules: WorkflowModule[] = moduleIds.map((id, i) => {
      const meta = getModuleById(id)!;
      return {
        id: `node-${now}-${i}`,
        moduleId: id,
        name: meta.displayName,
        category: meta.category,
        position: { x: 100 + i * 280, y: 200 },
        inputs: meta.inputFormats.map((f) => f.toLowerCase()),
        outputs: meta.outputFormats.map((f) => f.toLowerCase()),
      };
    });

    const templateConnections: WorkflowConnection[] = [];
    for (let i = 0; i < templateModules.length - 1; i++) {
      const from = templateModules[i];
      const to = templateModules[i + 1];
      const validation = validateModuleConnection(from.moduleId, to.moduleId);
      templateConnections.push({
        id: `conn-${now}-${i}`,
        from: from.id,
        to: to.id,
        fromPort: from.outputs[0] || "output",
        toPort: to.inputs[0] || "input",
        dataType: from.outputs[0] || "pdb",
        validated: validation.valid,
        learningAnnotation: validation.learningNote,
      });
    }

    setModules(templateModules);
    setConnections(templateConnections);
    setName("De Novo Antibody Design");
    setDescription("RFdiffusion → ProteinMPNN → ESMFold pipeline for antibody candidate generation");
    setMode("manual");
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── module actions ──────────────────────────────────────────── */

  const addModule = useCallback((meta: ModuleMetadata) => {
    const existingCount = modules.length;
    const col = existingCount % 3;
    const row = Math.floor(existingCount / 3);
    const newMod: WorkflowModule = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      moduleId: meta.id,
      name: meta.displayName,
      category: meta.category,
      position: { x: 100 + col * 280, y: 100 + row * 140 },
      inputs: meta.inputFormats.map((f) => f.toLowerCase()),
      outputs: meta.outputFormats.map((f) => f.toLowerCase()),
    };
    setModules((prev) => [...prev, newMod]);
    setValidationErrors([]);
    return newMod;
  }, [modules.length]);

  const addModuleAndConnect = useCallback((meta: ModuleMetadata, fromModule: WorkflowModule) => {
    const newMod: WorkflowModule = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      moduleId: meta.id,
      name: meta.displayName,
      category: meta.category,
      position: { x: fromModule.position.x + 280, y: fromModule.position.y },
      inputs: meta.inputFormats.map((f) => f.toLowerCase()),
      outputs: meta.outputFormats.map((f) => f.toLowerCase()),
    };
    setModules((prev) => [...prev, newMod]);

    const validation = validateModuleConnection(fromModule.moduleId, meta.id);
    if (validation.valid) {
      const fromMeta = getModuleById(fromModule.moduleId);
      const compatFmts = fromMeta?.outputFormats.filter((f) => meta.inputFormats.includes(f)) || [];
      const conn: WorkflowConnection = {
        id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from: fromModule.id,
        to: newMod.id,
        fromPort: fromModule.outputs[0] || "output",
        toPort: newMod.inputs[0] || "input",
        dataType: compatFmts[0]?.toLowerCase() || "unknown",
        validated: true,
        learningAnnotation: validation.learningNote,
      };
      setConnections((prev) => [...prev, conn]);
    }

    setValidationErrors([]);
  }, []);

  const moveModule = useCallback((id: string, pos: { x: number; y: number }) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, position: pos } : m))
    );
  }, []);

  const deleteModule = useCallback((id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    setConnections((prev) =>
      prev.filter((c) => c.from !== id && c.to !== id)
    );
    setSelectedModuleId(null);
    setValidationErrors([]);
  }, []);

  const addConnection = useCallback((conn: WorkflowConnection) => {
    setConnections((prev) => [...prev, conn]);
    setValidationErrors([]);
  }, []);

  const deleteConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    setValidationErrors([]);
  }, []);

  /* ── accept AI workflow ──────────────────────────────────────── */

  const handleAcceptAIWorkflow = useCallback((result: ComposeResult) => {
    const wfData = result.workflow;

    // Create workflow modules with unique node IDs
    const newModules: WorkflowModule[] = wfData.modules.map((m: any, i: number) => {
      const catalogMod = MODULE_CATALOG.find((c) => c.id === m.moduleId);
      return {
        id: `node-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        moduleId: m.moduleId,
        name: m.name || catalogMod?.displayName || m.moduleId,
        category: m.category || catalogMod?.category || "protein",
        position: m.position || { x: 100 + i * 280, y: 200 },
        inputs: m.inputs || catalogMod?.inputFormats.map((f: string) => f.toLowerCase()) || [],
        outputs: m.outputs || catalogMod?.outputFormats.map((f: string) => f.toLowerCase()) || [],
      };
    });

    // Create connections using new node IDs
    const newConnections: WorkflowConnection[] = (wfData.connections || [])
      .map((c: any) => {
        const fromMod = newModules[c.from];
        const toMod = newModules[c.to];
        if (!fromMod || !toMod) return null;

        const validation = validateModuleConnection(fromMod.moduleId, toMod.moduleId);

        return {
          id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          from: fromMod.id,
          to: toMod.id,
          fromPort: fromMod.outputs[0] || "output",
          toPort: toMod.inputs[0] || "input",
          dataType: c.dataType || "unknown",
          validated: validation.valid,
          learningAnnotation: c.learningAnnotation || validation.learningNote,
        };
      })
      .filter(Boolean) as WorkflowConnection[];

    setModules(newModules);
    setConnections(newConnections);
    setName(wfData.name || "");
    setDescription(wfData.description || "");
    setValidationErrors([]);
    setComposeResult(null);
    // Switch to manual mode so user can edit the AI-generated workflow
    setMode("manual");
  }, []);

  /* ── validate ────────────────────────────────────────────────── */

  const validate = (): boolean => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Workflow name is required");
    if (modules.length === 0) errors.push("Add at least one module");

    if (modules.length > 1) {
      const connectedIds = new Set<string>();
      connections.forEach((c) => {
        connectedIds.add(c.from);
        connectedIds.add(c.to);
      });
      const disconnected = modules.filter((m) => !connectedIds.has(m.id));
      if (disconnected.length > 0) {
        errors.push(
          `Disconnected modules: ${disconnected.map((m) => m.name).join(", ")}`
        );
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  /* ── save ─────────────────────────────────────────────────────── */

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    const workflow = {
      id: `wf-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      modules: modules.map((m) => ({
        id: m.id,
        moduleId: m.moduleId,
        name: m.name,
        category: m.category,
        position: m.position,
        inputs: m.inputs,
        outputs: m.outputs,
        parameters: m.parameters,
      })),
      connections: connections.map((c) => ({
        id: c.id,
        from: c.from,
        to: c.to,
        fromPort: c.fromPort,
        toPort: c.toPort,
        dataType: c.dataType,
        validated: c.validated,
        learningAnnotation: c.learningAnnotation,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveWorkflow(workflow);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    router.push("/workflows?saved=1");
  };

  /* ── selected module info ────────────────────────────────────── */

  const selectedMod = modules.find((m) => m.id === selectedModuleId);
  const selectedMeta = selectedMod ? getModuleById(selectedMod.moduleId) : null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 bg-dayhoff-bg-secondary px-6 py-3">
        <button
          onClick={() => router.push("/workflows")}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Mode toggle */}
        <div className="flex gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5">
          <button
            onClick={() => setMode("ai")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              mode === "ai"
                ? "bg-dayhoff-purple text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            AI Mode
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
              mode === "manual"
                ? "bg-dayhoff-purple text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Hand className="h-3.5 w-3.5" />
            Manual
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {modules.length} module{modules.length !== 1 ? "s" : ""} &middot;{" "}
            {connections.length} connection{connections.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => validate()}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" />
            Validate
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-dayhoff-purple px-4 py-1.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="border-b border-red-500/20 bg-red-500/5 px-6 py-2">
          {validationErrors.map((err, i) => (
            <div key={i} className="text-xs text-red-400">
              {err}
            </div>
          ))}
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: AI or Manual */}
        {mode === "ai" ? (
          <AIWorkflowComposer onResult={setComposeResult} />
        ) : (
          <ModulePalette onAddModule={addModule} />
        )}

        {/* Center: Canvas + AI Result Overlay */}
        <div className="relative flex-1">
          {/* Floating name/description on canvas */}
          <div className="absolute left-4 top-4 z-10 flex flex-col gap-0.5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workflow name..."
              className="w-[28rem] bg-transparent px-1 text-lg font-bold text-white placeholder-gray-600 focus:outline-none"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="w-[28rem] bg-transparent px-1 text-xs text-gray-400 placeholder-gray-600 focus:outline-none"
            />
          </div>
          {composeResult && (
            <AIResultOverlay
              result={composeResult}
              onAccept={handleAcceptAIWorkflow}
              onDismiss={() => setComposeResult(null)}
            />
          )}
          <WorkflowCanvas
            modules={modules}
            connections={connections}
            selectedModuleId={selectedModuleId}
            onSelectModule={setSelectedModuleId}
            onMoveModule={moveModule}
            onConnect={addConnection}
            onDeleteModule={deleteModule}
            onDeleteConnection={deleteConnection}
          />
        </div>

        {/* Right: Selected module info (when a module is selected) */}
        {selectedMeta && selectedMod && (
          <div className="w-64 overflow-y-auto border-l border-white/10 bg-dayhoff-bg-secondary p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                {selectedMeta.displayName}
              </h3>
              <button
                onClick={() => deleteModule(selectedMod.id)}
                className="text-gray-500 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-400">
              {selectedMeta.learning.conceptSummary}
            </p>

            <div className="mt-4 space-y-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="text-[10px] text-gray-500">Input</div>
                <div className="text-xs font-semibold text-white">
                  {selectedMeta.inputFormats.join(", ")}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="text-[10px] text-gray-500">Output</div>
                <div className="text-xs font-semibold text-white">
                  {selectedMeta.outputFormats.join(", ")}
                </div>
              </div>
              {selectedMeta.computeRequirements.gpu && (
                <div className="rounded-lg border border-dayhoff-amber/20 bg-dayhoff-amber/5 p-2">
                  <div className="text-[10px] text-dayhoff-amber">GPU Required</div>
                  <div className="text-xs text-gray-300">
                    {selectedMeta.computeRequirements.memory} memory
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="text-[10px] text-gray-500">Estimated Time</div>
                <div className="text-xs text-gray-300">
                  {selectedMeta.computeRequirements.timeEstimate}
                </div>
              </div>
            </div>

            {/* Key Insight */}
            <div className="mt-4 rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-3">
              <div className="text-[10px] font-semibold text-dayhoff-emerald">
                Key Insight
              </div>
              <p className="mt-1 text-xs leading-relaxed text-gray-300">
                {selectedMeta.learning.keyInsight}
              </p>
            </div>

            {/* Connections for this module */}
            {connections.filter(
              (c) => c.from === selectedMod.id || c.to === selectedMod.id
            ).length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] font-semibold uppercase text-gray-500">
                  Connections
                </div>
                <div className="mt-1 space-y-1">
                  {connections
                    .filter(
                      (c) =>
                        c.from === selectedMod.id || c.to === selectedMod.id
                    )
                    .map((c) => {
                      const other = modules.find(
                        (m) =>
                          m.id ===
                          (c.from === selectedMod.id ? c.to : c.from)
                      );
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2 py-1.5"
                        >
                          <span className="text-xs text-gray-300">
                            {c.from === selectedMod.id ? "→" : "←"}{" "}
                            {other?.name || "?"}
                          </span>
                          <span className="text-[9px] text-gray-500">
                            {c.dataType}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Recommended Next Modules */}
            {(() => {
              const downstream = getCompatibleModules(selectedMod.moduleId, "downstream")
                .filter((m) => !modules.some((existing) => existing.moduleId === m.id));
              if (downstream.length === 0) return null;
              return (
                <div className="mt-4">
                  <div className="text-[10px] font-semibold uppercase text-gray-500">
                    Recommended Next
                  </div>
                  <div className="mt-1.5 space-y-1.5">
                    {downstream.map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => addModuleAndConnect(rec, selectedMod)}
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-left transition-all hover:border-dayhoff-purple/30 hover:bg-dayhoff-purple/5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">
                            {rec.displayName}
                          </span>
                          <Plus className="h-3 w-3 text-gray-500" />
                        </div>
                        <p className="mt-1 text-[10px] leading-relaxed text-gray-500">
                          {rec.learning.conceptSummary.length > 100
                            ? rec.learning.conceptSummary.slice(0, 100) + "…"
                            : rec.learning.conceptSummary}
                        </p>
                        <div className="mt-1.5 flex gap-1">
                          {rec.inputFormats.map((f) => (
                            <span key={f} className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[8px] font-medium uppercase text-blue-400">
                              {f}
                            </span>
                          ))}
                          <span className="text-[8px] text-gray-600">→</span>
                          {rec.outputFormats.map((f) => (
                            <span key={f} className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium uppercase text-emerald-400">
                              {f}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom chat */}
      <BuilderChat
        name={name}
        description={description}
        modules={modules}
        connections={connections}
      />
    </div>
  );
}
