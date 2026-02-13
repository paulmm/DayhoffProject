"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomWorkflows } from "@/hooks/useCustomWorkflows";
import { getModuleById } from "@/data/modules-catalog";
import {
  EXPERIMENT_RECIPES,
  type ExperimentRecipe,
  type RecipeParameter,
} from "@/data/experiment-recipes";
import { parsePdbChains } from "@/lib/pdb-parser";
import { getDemoPdbId } from "@/data/recipe-demo-structures";
import MolstarViewerDynamic from "@/components/molstar/MolstarViewerDynamic";
import {
  FlaskConical,
  Brain,
  BarChart3,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Clock,
  Cpu,
  Info,
  Upload,
  Loader2,
  Rocket,
  CheckCircle2,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */

type WizardStep = 1 | 2 | 3;
type ExperimentMode = "single" | "multi";
type RecipeTab = "workflows" | "ai" | "my";

/* ── Step 1 — Choose Mode & Workflow ─────────────────────────── */

function ModeCard({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-5 text-left transition-all ${
        active
          ? "border-dayhoff-purple/60 bg-dayhoff-purple/10"
          : "border-white/10 bg-dayhoff-bg-secondary hover:border-white/20"
      }`}
    >
      <Icon
        className={`mt-0.5 h-6 w-6 shrink-0 ${
          active ? "text-dayhoff-purple" : "text-gray-400"
        }`}
      />
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm text-gray-400">{description}</div>
      </div>
    </button>
  );
}

function RecipeCard({
  recipe,
  onSelect,
}: {
  recipe: ExperimentRecipe;
  onSelect: (recipe: ExperimentRecipe) => void;
}) {
  const [learnExpanded, setLearnExpanded] = useState(false);
  const modules = recipe.moduleIds
    .map((id) => getModuleById(id))
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white">{recipe.name}</h3>
          <p className="mt-1 text-sm text-gray-400">{recipe.description}</p>
        </div>
        <button
          onClick={() => onSelect(recipe)}
          className="ml-4 shrink-0 rounded-lg bg-dayhoff-purple px-4 py-2 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
        >
          Select
        </button>
      </div>

      {/* Pipeline visualization */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto">
        {modules.map((mod, i) => (
          <div key={mod!.id} className="flex items-center gap-2">
            <div className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-xs font-semibold text-white">
                {mod!.displayName}
              </div>
              <div className="mt-0.5 text-[10px] text-gray-500">
                {mod!.inputFormats.join("/")} → {mod!.outputFormats.join("/")}
              </div>
            </div>
            {i < modules.length - 1 && (
              <ArrowRight className="h-4 w-4 shrink-0 text-gray-600" />
            )}
          </div>
        ))}
      </div>

      {/* Meta badges */}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
        {recipe.requiresGpu && (
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3" /> GPU Required
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {recipe.timeEstimate}
        </span>
      </div>

      {/* What will I learn? */}
      <button
        onClick={() => setLearnExpanded(!learnExpanded)}
        className="mt-3 flex items-center gap-1 text-xs font-semibold text-dayhoff-emerald hover:underline"
      >
        <GraduationCap className="h-3.5 w-3.5" />
        {learnExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        What will I learn?
      </button>

      {learnExpanded && (
        <div className="mt-3 rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-4">
          <ul className="space-y-1.5">
            {recipe.whatWillLearn.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-300"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-dayhoff-emerald" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AIRecommendation({
  onAccept,
}: {
  onAccept: (recipe: ExperimentRecipe) => void;
}) {
  const [goal, setGoal] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    suggestedRecipeId: string;
    confidence: number;
    reasoning: string;
    learningObjectives: string[];
    alternativeRecipeId: string | null;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!goal.trim()) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch("/api/experiments/analyze-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch {
      // Silently fail
    } finally {
      setAnalyzing(false);
    }
  };

  const suggestedRecipe = result
    ? EXPERIMENT_RECIPES.find((r) => r.id === result.suggestedRecipeId)
    : null;
  const altRecipe = result?.alternativeRecipeId
    ? EXPERIMENT_RECIPES.find((r) => r.id === result.alternativeRecipeId)
    : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
        <h3 className="text-sm font-semibold text-white">
          Describe your research goal
        </h3>
        <p className="mt-1 text-xs text-gray-400">
          Tell us what you want to achieve and we&apos;ll suggest the best
          experiment recipe.
        </p>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., I want to design a novel protein binder that targets the spike protein RBD..."
          rows={3}
          className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
        />
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !goal.trim()}
          className="mt-3 flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-50"
        >
          {analyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          Analyze Goal
        </button>
      </div>

      {/* AI Recommendation result */}
      {result && suggestedRecipe && (
        <div className="rounded-xl border border-dayhoff-purple/30 bg-dayhoff-purple/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-dayhoff-purple">
            <Brain className="h-4 w-4" />
            AI Recommendation
          </div>

          {/* Confidence bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Confidence</span>
              <span className="text-dayhoff-emerald">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-dayhoff-emerald transition-all"
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          </div>

          <h3 className="mt-4 text-base font-semibold text-white">
            {suggestedRecipe.name}
          </h3>
          <p className="mt-1 text-sm text-gray-300">{result.reasoning}</p>

          {/* Learning objectives */}
          {result.learningObjectives.length > 0 && (
            <div className="mt-3 rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-3">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-dayhoff-emerald">
                <GraduationCap className="h-3 w-3" /> What You&apos;ll Learn
              </div>
              <ul className="mt-1.5 space-y-1">
                {result.learningObjectives.map((obj, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-gray-400"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-dayhoff-emerald" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => onAccept(suggestedRecipe)}
              className="flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
            >
              <CheckCircle2 className="h-4 w-4" />
              Accept & Configure
            </button>
            {altRecipe && (
              <button
                onClick={() => onAccept(altRecipe)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/10"
              >
                Try {altRecipe.name} instead
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 2 — Configure Parameters ───────────────────────────── */

function ParameterField({
  param,
  value,
  onChange,
  availableChains,
  onFileRead,
}: {
  param: RecipeParameter;
  value: string | number;
  onChange: (val: string | number) => void;
  availableChains?: string[];
  onFileRead?: (paramId: string, text: string) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [fetchingExample, setFetchingExample] = useState(false);

  const handleTryExample = async () => {
    setFetchingExample(true);
    try {
      const res = await fetch("https://files.rcsb.org/download/6M0J.pdb");
      if (!res.ok) throw new Error("Failed to fetch");
      const text = await res.text();
      onChange("6M0J.pdb");
      onFileRead?.(param.id, text);
    } catch {
      // Silently fail
    } finally {
      setFetchingExample(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-300">
          {param.label}
          {param.required && <span className="text-red-400"> *</span>}
        </label>
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className={`rounded p-0.5 transition-colors ${
            showTooltip
              ? "text-dayhoff-emerald"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
        {param.unit && param.type === "range" && (
          <span className="ml-auto text-sm font-semibold text-dayhoff-purple">
            {value} {param.unit}
          </span>
        )}
      </div>

      {/* Tooltip panel */}
      {showTooltip && (
        <div className="rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-3 text-xs">
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-dayhoff-emerald">
                What is this?
              </span>
              <p className="mt-0.5 text-gray-300">{param.tooltip.what}</p>
            </div>
            <div>
              <span className="font-semibold text-dayhoff-emerald">
                How it affects results
              </span>
              <p className="mt-0.5 text-gray-300">{param.tooltip.effect}</p>
            </div>
            <div>
              <span className="font-semibold text-dayhoff-emerald">
                Recommended
              </span>
              <p className="mt-0.5 text-gray-300">
                {param.tooltip.recommended}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input control */}
      {param.type === "range" && (
        <div>
          <input
            type="range"
            min={param.min}
            max={param.max}
            step={param.step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full accent-dayhoff-purple"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{param.min}</span>
            <span>{param.max}</span>
          </div>
        </div>
      )}

      {param.type === "number" && (
        <input
          type="number"
          min={param.min}
          max={param.max}
          step={param.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
        />
      )}

      {param.type === "text" && param.id === "chain_selection" && availableChains && availableChains.length > 0 ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {availableChains.map((chain) => {
              const selected = String(value) === chain;
              return (
                <button
                  key={chain}
                  type="button"
                  onClick={() => onChange(chain)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                    selected
                      ? "border-dayhoff-purple bg-dayhoff-purple/20 text-dayhoff-purple"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  Chain {chain}
                  {selected && <span className="ml-1.5 text-xs">&#10003;</span>}
                </button>
              );
            })}
            {availableChains.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(availableChains.join(","))}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                  String(value) === availableChains.join(",")
                    ? "border-dayhoff-purple bg-dayhoff-purple/20 text-dayhoff-purple"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                All chains
                {String(value) === availableChains.join(",") && <span className="ml-1.5 text-xs">&#10003;</span>}
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-500">
            Selected chain is highlighted in the 3D viewer
          </p>
        </div>
      ) : param.type === "text" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
        />
      )}

      {param.type === "multitext" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder}
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
        />
      )}

      {param.type === "select" && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
        >
          {param.options?.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-dayhoff-bg-secondary">
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {param.type === "file" && (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-white/20 bg-white/5 p-4">
          <Upload className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            {value ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white">{String(value)}</span>
                <button
                  onClick={() => {
                    onChange("");
                    onFileRead?.(param.id, "");
                  }}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-400">
                  {param.placeholder || "Upload file or drag & drop"}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  PDB files accepted
                </p>
              </div>
            )}
          </div>
          {!value && (
            <div className="flex items-center gap-2">
              <label className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10">
                Browse
                <input
                  type="file"
                  accept=".pdb"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file.name);
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const text = ev.target?.result as string;
                        if (text) onFileRead?.(param.id, text);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
              {param.id === "input_pdb" && (
                <button
                  onClick={handleTryExample}
                  disabled={fetchingExample}
                  className="flex items-center gap-1.5 rounded-lg border border-dayhoff-emerald/30 bg-dayhoff-emerald/10 px-3 py-1.5 text-xs font-semibold text-dayhoff-emerald hover:bg-dayhoff-emerald/20 disabled:opacity-50"
                >
                  {fetchingExample ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <FlaskConical className="h-3 w-3" />
                  )}
                  Try example (6M0J)
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Step 3 — Review & Launch ────────────────────────────────── */

function ReviewStep({
  recipe,
  paramValues,
  experimentName,
  experimentDescription,
  onNameChange,
  onDescriptionChange,
  onLaunch,
  launching,
}: {
  recipe: ExperimentRecipe;
  paramValues: Record<string, string | number>;
  experimentName: string;
  experimentDescription: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onLaunch: () => void;
  launching: boolean;
}) {
  const modules = recipe.moduleIds
    .map((id) => getModuleById(id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Name & description */}
      <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
        <h3 className="text-sm font-semibold text-white">Experiment Details</h3>
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs text-gray-400">Name</label>
            <input
              type="text"
              value={experimentName}
              onChange={(e) => onNameChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Description</label>
            <textarea
              value={experimentDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
            />
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
        <h3 className="text-sm font-semibold text-white">Configuration Summary</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Recipe</span>
            <span className="text-white">{recipe.name}</span>
          </div>
          {[...recipe.parameters, ...recipe.commonParameters]
            .filter((p) => paramValues[p.id] !== undefined && paramValues[p.id] !== "")
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-400">{p.label}</span>
                <span className="text-white">
                  {String(paramValues[p.id])}
                  {p.unit ? ` ${p.unit}` : ""}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
        <h3 className="text-sm font-semibold text-white">Pipeline</h3>
        <div className="mt-3 flex items-center gap-2 overflow-x-auto">
          {modules.map((mod, i) => (
            <div key={mod!.id} className="flex items-center gap-2">
              <div className="shrink-0 rounded-lg border border-dayhoff-purple/30 bg-dayhoff-purple/10 px-4 py-3">
                <div className="text-sm font-semibold text-white">
                  {mod!.displayName}
                </div>
                <div className="mt-0.5 text-[10px] text-gray-400">
                  {mod!.inputFormats.join("/")} → {mod!.outputFormats.join("/")}
                </div>
              </div>
              {i < modules.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0 text-dayhoff-purple" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {recipe.timeEstimate}
          </span>
          {recipe.requiresGpu && (
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" /> GPU Required
            </span>
          )}
        </div>
      </div>

      {/* What to expect */}
      <div className="rounded-xl border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-dayhoff-emerald">
          <GraduationCap className="h-4 w-4" />
          What to Expect
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-300">
          {recipe.whatToExpect}
        </p>
        {paramValues.output_format && (
          <p className="mt-2 text-xs text-gray-400">
            Output format:{" "}
            <span className="text-dayhoff-emerald">
              {paramValues.output_format === "both"
                ? "PDB + FASTA"
                : String(paramValues.output_format).toUpperCase()}
            </span>
          </p>
        )}
      </div>

      {/* Launch button */}
      <button
        onClick={onLaunch}
        disabled={launching || !experimentName.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-dayhoff-purple px-6 py-3 text-base font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-50"
      >
        {launching ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Rocket className="h-5 w-5" />
        )}
        Launch Experiment
      </button>
    </div>
  );
}

/* ── Main Wizard ─────────────────────────────────────────────── */

export default function NewExperimentPage() {
  const router = useRouter();
  const { workflows } = useCustomWorkflows();

  const [step, setStep] = useState<WizardStep>(1);
  const [mode, setMode] = useState<ExperimentMode>("single");
  const [recipeTab, setRecipeTab] = useState<RecipeTab>("workflows");
  const [selectedRecipe, setSelectedRecipe] = useState<ExperimentRecipe | null>(
    null
  );
  const [paramValues, setParamValues] = useState<
    Record<string, string | number>
  >({});
  const [experimentName, setExperimentName] = useState("");
  const [experimentDescription, setExperimentDescription] = useState("");
  const [launching, setLaunching] = useState(false);
  const [uploadedPdbText, setUploadedPdbText] = useState("");
  const [availableChains, setAvailableChains] = useState<string[]>([]);
  const [viewerExpanded, setViewerExpanded] = useState(false);

  /* ── Handlers ───────────────────────────── */

  const handleSelectRecipe = (recipe: ExperimentRecipe) => {
    setSelectedRecipe(recipe);

    // Initialize default parameter values
    const defaults: Record<string, string | number> = {};
    [...recipe.parameters, ...recipe.commonParameters].forEach((p) => {
      defaults[p.id] = p.default;
    });
    setParamValues(defaults);
    setExperimentName(`${recipe.name} — ${new Date().toLocaleDateString()}`);
    setExperimentDescription(recipe.description);
    setStep(2);
  };

  const handleSelectCustomWorkflow = (wf: (typeof workflows)[0]) => {
    // Create a lightweight recipe-like object from custom workflow
    const recipe: ExperimentRecipe = {
      id: `custom-${wf.id}`,
      name: wf.name,
      description: wf.description,
      moduleIds: wf.modules.map((m) => m.moduleId),
      timeEstimate: "Varies",
      requiresGpu: wf.modules.some(
        (m) => getModuleById(m.moduleId)?.computeRequirements.gpu
      ),
      whatWillLearn: ["Custom workflow — learning content depends on configured modules"],
      whatToExpect:
        "This is a custom workflow you created. Results depend on the modules and connections you configured. Check each module's documentation for expected inputs and outputs.",
      parameters: [],
      commonParameters: [
        {
          id: "random_seed",
          label: "Random Seed",
          type: "number",
          default: 42,
          min: 0,
          max: 999999,
          tooltip: {
            what: "A number that initializes the random number generator.",
            effect: "Using the same seed produces identical outputs across runs.",
            recommended: "Keep the default (42) for your first run.",
          },
        },
      ],
    };
    handleSelectRecipe(recipe);
  };

  const handleParamChange = (id: string, value: string | number) => {
    setParamValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileRead = (paramId: string, text: string) => {
    if (paramId === "input_pdb") {
      if (text) {
        setUploadedPdbText(text);
        const chains = parsePdbChains(text);
        setAvailableChains(chains);
        // Auto-set chain_selection to first chain
        if (chains.length > 0) {
          setParamValues((prev) => ({ ...prev, chain_selection: chains[0] }));
        }
      } else {
        setUploadedPdbText("");
        setAvailableChains([]);
      }
    }
  };

  const handleAddHotspot = (residue: { chainId: string; seqId: number }) => {
    const tag = `${residue.chainId}${residue.seqId}`;
    const current = String(paramValues["hotspot_residues"] || "");
    const existing = current.split(",").map((s) => s.trim()).filter(Boolean);
    if (!existing.includes(tag)) {
      existing.push(tag);
      handleParamChange("hotspot_residues", existing.join(","));
    }
  };

  const canProceedToReview = () => {
    if (!selectedRecipe) return false;
    return selectedRecipe.parameters
      .filter((p) => p.required)
      .every((p) => {
        const val = paramValues[p.id];
        return val !== undefined && val !== "";
      });
  };

  const handleLaunch = async () => {
    if (!selectedRecipe) return;
    setLaunching(true);

    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: experimentName.trim(),
          goal: experimentDescription.trim(),
          parameters: paramValues,
          config: {
            recipeId: selectedRecipe.id,
            recipeName: selectedRecipe.name,
            moduleIds: selectedRecipe.moduleIds,
            timeEstimate: selectedRecipe.timeEstimate,
            requiresGpu: selectedRecipe.requiresGpu,
          },
        }),
      });

      if (res.ok) {
        const experiment = await res.json();
        // Save to sessionStorage for the running page
        sessionStorage.setItem(
          `experiment-${experiment.id}`,
          JSON.stringify(experiment)
        );
        router.push(`/experiments/${experiment.id}/running`);
      }
    } catch {
      // Error handled silently
    } finally {
      setLaunching(false);
    }
  };

  /* ── Render ─────────────────────────────── */

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">New Experiment</h1>
        <p className="mt-1 text-sm text-gray-400">
          {step === 1 && "Choose how you want to set up your experiment."}
          {step === 2 && "Configure parameters for your experiment."}
          {step === 3 && "Review your configuration and launch."}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step === s
                  ? "bg-dayhoff-purple text-white"
                  : step > s
                    ? "bg-dayhoff-emerald text-white"
                    : "bg-white/10 text-gray-500"
              }`}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            <span
              className={`text-sm ${
                step === s ? "font-semibold text-white" : "text-gray-500"
              }`}
            >
              {s === 1 && "Choose"}
              {s === 2 && "Configure"}
              {s === 3 && "Review"}
            </span>
            {s < 3 && (
              <div
                className={`mx-2 h-px w-8 ${
                  step > s ? "bg-dayhoff-emerald" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1 ──────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Mode selection */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ModeCard
              icon={FlaskConical}
              title="Single Experiment"
              description="Choose a recipe and configure parameters"
              active={mode === "single"}
              onClick={() => setMode("single")}
            />
            <ModeCard
              icon={BarChart3}
              title="Multi-Experiment"
              description="Run parameter sweeps across variations"
              active={mode === "multi"}
              onClick={() => setMode("multi")}
            />
          </div>

          {/* Tabs: Workflows / AI Suggested / My Workflows */}
          <div className="space-y-4">
            <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setRecipeTab("ai")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                  recipeTab === "ai"
                    ? "bg-dayhoff-purple text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                AI Suggested
              </button>
              <button
                onClick={() => setRecipeTab("workflows")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                  recipeTab === "workflows"
                    ? "bg-dayhoff-purple text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Workflows
              </button>
              <button
                onClick={() => setRecipeTab("my")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                  recipeTab === "my"
                    ? "bg-dayhoff-purple text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                My Workflows
                {workflows.length > 0 && (
                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {workflows.length}
                  </span>
                )}
              </button>
            </div>

            {/* Workflows tab */}
            {recipeTab === "workflows" && (
              <div className="space-y-4">
                {EXPERIMENT_RECIPES.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={handleSelectRecipe}
                  />
                ))}
              </div>
            )}

            {/* AI Suggested tab */}
            {recipeTab === "ai" && (
              <AIRecommendation onAccept={handleSelectRecipe} />
            )}

            {/* My Workflows tab */}
            {recipeTab === "my" && (
              <div className="space-y-4">
                {workflows.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-12 text-center">
                    <FlaskConical className="mx-auto h-10 w-10 text-gray-600" />
                    <p className="mt-3 text-sm text-gray-400">
                      No custom workflows yet.
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Create workflows in the Workflow Builder to use them here.
                    </p>
                  </div>
                ) : (
                  workflows.map((wf) => (
                    <div
                      key={wf.id}
                      className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {wf.name}
                          </h3>
                          {wf.description && (
                            <p className="mt-1 text-sm text-gray-400">
                              {wf.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleSelectCustomWorkflow(wf)}
                          className="ml-4 shrink-0 rounded-lg bg-dayhoff-purple px-4 py-2 text-sm font-semibold text-white hover:bg-dayhoff-purple/80"
                        >
                          Select
                        </button>
                      </div>
                      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                        {wf.modules.map((mod, i) => (
                          <div
                            key={mod.id}
                            className="flex items-center gap-2"
                          >
                            <div className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                              <div className="text-xs font-semibold text-white">
                                {mod.name}
                              </div>
                            </div>
                            {i < wf.modules.length - 1 && (
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {wf.modules.length} module
                        {wf.modules.length !== 1 ? "s" : ""} &middot; Updated{" "}
                        {new Date(wf.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2 — Configure Parameters ───── */}
      {step === 2 && selectedRecipe && (
        <div className="space-y-6">
          {/* Expanded viewer panel — shown above the grid when expanded */}
          {viewerExpanded && (
            <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Structure Viewer
                </h3>
                <button
                  onClick={() => setViewerExpanded(false)}
                  title="Collapse viewer"
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                  Collapse
                </button>
              </div>
              <div className="mt-3">
                <MolstarViewerDynamic
                  pdbData={uploadedPdbText || undefined}
                  pdbId={!uploadedPdbText ? (getDemoPdbId(selectedRecipe.id) ?? undefined) : undefined}
                  highlightedChain={uploadedPdbText && availableChains.length > 1 ? String(paramValues["chain_selection"] || "") : undefined}
                  height="h-[500px]"
                  resizable
                  onResidueClick={handleAddHotspot}
                />
              </div>
              {uploadedPdbText && availableChains.length > 0 && (
                <p className="mt-2 text-[10px] text-gray-500">
                  Showing uploaded structure &middot; {availableChains.length} chain{availableChains.length !== 1 ? "s" : ""} detected
                </p>
              )}
              {!uploadedPdbText && getDemoPdbId(selectedRecipe.id) && (
                <p className="mt-2 text-[10px] text-gray-500">
                  Demo structure: PDB {getDemoPdbId(selectedRecipe.id)}
                </p>
              )}
            </div>
          )}

          <div className={`grid grid-cols-1 gap-6 ${viewerExpanded ? "" : "lg:grid-cols-5"}`}>
            {/* Left: parameter form */}
            <div className={`space-y-6 ${viewerExpanded ? "" : "lg:col-span-3"}`}>
              {/* Recipe-specific parameters */}
              {selectedRecipe.parameters.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
                  <h3 className="text-sm font-semibold text-white">
                    {selectedRecipe.name} Parameters
                  </h3>
                  <div className="mt-4 space-y-5">
                    {selectedRecipe.parameters.map((param) => (
                      <ParameterField
                        key={param.id}
                        param={param}
                        value={paramValues[param.id] ?? param.default}
                        onChange={(val) => handleParamChange(param.id, val)}
                        availableChains={availableChains}
                        onFileRead={handleFileRead}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Common parameters */}
              <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
                <h3 className="text-sm font-semibold text-white">
                  General Settings
                </h3>
                <div className="mt-4 space-y-5">
                  {selectedRecipe.commonParameters.map((param) => (
                    <ParameterField
                      key={param.id}
                      param={param}
                      value={paramValues[param.id] ?? param.default}
                      onChange={(val) => handleParamChange(param.id, val)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar: 3D viewer (compact) — hidden when expanded */}
            {!viewerExpanded && (
              <div className="hidden lg:col-span-2 lg:block">
                <div className="sticky top-8 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Structure Preview
                    </h3>
                    <button
                      onClick={() => setViewerExpanded(true)}
                      title="Expand viewer"
                      className="rounded-md border border-white/10 bg-white/5 p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-3">
                    <MolstarViewerDynamic
                      pdbData={uploadedPdbText || undefined}
                      pdbId={!uploadedPdbText ? (getDemoPdbId(selectedRecipe.id) ?? undefined) : undefined}
                      highlightedChain={uploadedPdbText && availableChains.length > 1 ? String(paramValues["chain_selection"] || "") : undefined}
                      height="h-96"
                      onResidueClick={handleAddHotspot}
                    />
                  </div>
                  {uploadedPdbText && availableChains.length > 0 && (
                    <p className="mt-2 text-[10px] text-gray-500">
                      Showing uploaded structure &middot; {availableChains.length} chain{availableChains.length !== 1 ? "s" : ""} detected
                    </p>
                  )}
                  {!uploadedPdbText && getDemoPdbId(selectedRecipe.id) && (
                    <p className="mt-2 text-[10px] text-gray-500">
                      Demo structure: PDB {getDemoPdbId(selectedRecipe.id)}
                    </p>
                  )}

                  {/* Quick info */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>Est. {selectedRecipe.timeEstimate}</span>
                    </div>
                    {selectedRecipe.requiresGpu && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Cpu className="h-3 w-3" />
                        <span>GPU Required</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <FlaskConical className="h-3 w-3" />
                      <span>
                        {selectedRecipe.moduleIds.length} module
                        {selectedRecipe.moduleIds.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedToReview()}
              className="flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-50"
            >
              Review & Launch
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3 — Review & Launch ────────── */}
      {step === 3 && selectedRecipe && (
        <div className="space-y-6">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Configure
          </button>
          <ReviewStep
            recipe={selectedRecipe}
            paramValues={paramValues}
            experimentName={experimentName}
            experimentDescription={experimentDescription}
            onNameChange={setExperimentName}
            onDescriptionChange={setExperimentDescription}
            onLaunch={handleLaunch}
            launching={launching}
          />
        </div>
      )}
    </div>
  );
}
