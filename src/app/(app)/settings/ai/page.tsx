"use client";

import { useState, useEffect, useCallback } from "react";
import FadeIn from "@/components/motion/FadeIn";
import {
  Eye,
  EyeOff,
  Save,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  BookOpen,
  MessageSquare,
  Crosshair,
  FlaskConical,
  Sparkles,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";

interface AISettings {
  anthropicApiKey: string | null;
  hasApiKey: boolean;
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  enableStreaming: boolean;
  enableCaching: boolean;
  learningMode: string;
  learnerType: string;
}

const MODELS = [
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    inputPrice: "$5",
    outputPrice: "$25",
    badge: null,
  },
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    inputPrice: "$3",
    outputPrice: "$15",
    badge: "Best Performing",
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    inputPrice: "$3",
    outputPrice: "$15",
    badge: null,
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    inputPrice: "$1",
    outputPrice: "$5",
    badge: null,
  },
];

const DEFAULT_SETTINGS: AISettings = {
  anthropicApiKey: null,
  hasApiKey: false,
  modelId: "claude-sonnet-4-5-20250929",
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  topK: 0,
  enableStreaming: true,
  enableCaching: false,
  learningMode: "socratic",
  learnerType: "HANDS_ON",
};

const PRESETS = [
  {
    id: "precise",
    name: "Precise Analyst",
    description:
      "Focused and deterministic — ideal for exact calculations, sequence analysis, and reproducible results.",
    icon: Crosshair,
    iconColor: "text-blue-400",
    activeClasses: "border-blue-400/60 bg-blue-400/10",
    temperature: 0.1,
    maxTokens: 4096,
    topP: 0.9,
    topK: 40,
  },
  {
    id: "thoughtful",
    name: "Thoughtful Scientist",
    description:
      "Balanced approach — great for general scientific work, data interpretation, and experimental design.",
    icon: FlaskConical,
    iconColor: "text-dayhoff-emerald",
    activeClasses: "border-dayhoff-emerald/60 bg-dayhoff-emerald/10",
    temperature: 0.5,
    maxTokens: 4096,
    topP: 1.0,
    topK: 0,
  },
  {
    id: "creative",
    name: "Creative Researcher",
    description:
      "Exploratory and innovative — perfect for hypothesis generation, literature insights, and novel approaches.",
    icon: Sparkles,
    iconColor: "text-dayhoff-amber",
    activeClasses: "border-dayhoff-amber/60 bg-dayhoff-amber/10",
    temperature: 0.9,
    maxTokens: 6144,
    topP: 1.0,
    topK: 0,
  },
  {
    id: "custom",
    name: "Custom Configuration",
    description:
      "Fine-tune parameters to match your specific workflow needs.",
    icon: SlidersHorizontal,
    iconColor: "text-dayhoff-purple",
    activeClasses: "border-dayhoff-purple/60 bg-dayhoff-purple/10",
    temperature: null,
    maxTokens: null,
    topP: null,
    topK: null,
  },
] as const;

function getActivePreset(settings: AISettings): string {
  for (const preset of PRESETS) {
    if (preset.id === "custom") continue;
    if (
      settings.temperature === preset.temperature &&
      settings.maxTokens === preset.maxTokens &&
      settings.topP === preset.topP &&
      settings.topK === preset.topK
    ) {
      return preset.id;
    }
  }
  return "custom";
}

function BehaviorSection({
  settings,
  setSettings,
}: {
  settings: AISettings;
  setSettings: React.Dispatch<React.SetStateAction<AISettings>>;
}) {
  const matchedPreset = getActivePreset(settings);
  const [forceCustom, setForceCustom] = useState(false);

  const activePreset = forceCustom ? "custom" : matchedPreset;

  const applyPreset = (presetId: string) => {
    if (presetId === "custom") {
      setForceCustom(true);
      return;
    }
    setForceCustom(false);
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSettings((s) => ({
      ...s,
      temperature: preset.temperature!,
      maxTokens: preset.maxTokens!,
      topP: preset.topP!,
      topK: preset.topK!,
    }));
  };

  return (
    <section className="space-y-4 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          AI Behavior &amp; Personality
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Choose how your AI assistant thinks and responds to scientific
          challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          const Icon = preset.icon;
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                isActive
                  ? preset.activeClasses
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${preset.iconColor}`}
              />
              <div>
                <div className="font-semibold text-white">{preset.name}</div>
                <div className="mt-1 text-xs text-gray-400">
                  {preset.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Scientific Approach & Response Depth — always visible */}
      <div className="mt-4 space-y-5 rounded-lg border border-white/10 bg-white/5 p-5">
        {/* Scientific Approach (Temperature) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">
              Scientific Approach
            </label>
            <span className="text-sm font-semibold text-dayhoff-purple">
              {settings.temperature.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.temperature}
            onChange={(e) => {
              setForceCustom(true);
              setSettings((s) => ({
                ...s,
                temperature: parseFloat(e.target.value),
              }));
            }}
            className="w-full accent-dayhoff-purple"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Precise &amp; Reproducible</span>
            <span>Creative &amp; Exploratory</span>
          </div>
        </div>

        {/* Response Depth (Max Tokens) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Response Depth</label>
            <span className="text-sm font-semibold text-dayhoff-purple">
              {settings.maxTokens.toLocaleString()} tokens
            </span>
          </div>
          <input
            type="range"
            min="256"
            max="8192"
            step="256"
            value={settings.maxTokens}
            onChange={(e) => {
              setForceCustom(true);
              setSettings((s) => ({
                ...s,
                maxTokens: parseInt(e.target.value),
              }));
            }}
            className="w-full accent-dayhoff-purple"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Concise</span>
            <span>Comprehensive</span>
          </div>
        </div>
      </div>

      {/* Advanced sliders — only visible when "Custom" is active */}
      {activePreset === "custom" && (
        <div className="space-y-5 rounded-lg border border-dayhoff-purple/20 bg-dayhoff-purple/5 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-dayhoff-purple">
            Advanced Parameters
          </div>

          {/* Top P */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Top P (Nucleus Sampling)</label>
              <span className="text-sm font-semibold text-dayhoff-purple">
                {settings.topP.toFixed(2)}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Controls the diversity of word choices. The model picks from the smallest set of words whose combined probability reaches this threshold. Lower values (e.g. 0.5) make responses more focused and predictable. Higher values (e.g. 1.0) allow the full vocabulary, producing more varied output.
            </p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.topP}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  topP: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-dayhoff-purple"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.1 (highly focused)</span>
              <span>1.0 (full vocabulary)</span>
            </div>
          </div>

          {/* Top K */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Top K (Token Limit)</label>
              <span className="text-sm font-semibold text-dayhoff-purple">
                {settings.topK}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Limits how many words the model considers at each step. A value of 40 means only the top 40 most likely words are candidates. Lower values produce more deterministic output; higher values allow more creative responses. Set to 0 to disable this filter entirely and let Top P handle diversity on its own.
            </p>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.topK}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  topK: parseInt(e.target.value),
                }))
              }
              className="w-full accent-dayhoff-purple"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 (disabled)</span>
              <span>100 (broad selection)</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/ai");
      const data = await res.json();
      if (data) {
        setSettings(data);
        if (data.hasApiKey) {
          setApiKeyInput(data.anthropicApiKey || "");
        }
      }
    } catch {
      // Use defaults
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const payload = {
        ...settings,
        anthropicApiKey: apiKeyInput || undefined,
      };
      const res = await fetch("/api/settings/ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.hasApiKey) setApiKeyInput(data.anthropicApiKey || "");
        setSaveMessage("Settings saved successfully");
      } else {
        setSaveMessage("Failed to save settings");
      }
    } catch {
      setSaveMessage("Failed to save settings");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKeyInput.startsWith("sk-ant-•••") ? undefined : apiKeyInput,
          modelId: settings.modelId,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, message: "Request failed" });
    } finally {
      setTesting(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-dayhoff-purple" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <FadeIn>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Settings</h1>
          <p className="mt-1 text-sm text-gray-400">
            Configure your Anthropic API connection and model preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Test Connection
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-dayhoff-purple px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dayhoff-purple/80 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </button>
        </div>
      </div>
      </FadeIn>

      {/* Test/Save Result Messages */}
      {testResult && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
            testResult.success
              ? "border-dayhoff-emerald/30 bg-dayhoff-emerald/10 text-dayhoff-emerald"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {testResult.message}
        </div>
      )}
      {saveMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-dayhoff-purple/30 bg-dayhoff-purple/10 p-3 text-sm text-dayhoff-purple">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {saveMessage}
        </div>
      )}

      {/* Learning Preference */}
      <FadeIn delay={0.05}>
      <section className="space-y-3 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6">
        <h2 className="text-lg font-semibold text-white">
          Learning Preference
        </h2>
        <p className="text-sm text-gray-400">
          Choose how the AI interacts with you during learning.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() =>
              setSettings((s) => ({ ...s, learningMode: "socratic" }))
            }
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
              settings.learningMode === "socratic"
                ? "border-dayhoff-emerald bg-dayhoff-emerald/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-dayhoff-emerald" />
            <div>
              <div className="font-semibold text-white">Socratic Mode</div>
              <div className="mt-1 text-xs text-gray-400">
                AI asks questions before giving answers — guides you to discover
                insights yourself.
              </div>
            </div>
          </button>
          <button
            onClick={() =>
              setSettings((s) => ({ ...s, learningMode: "direct" }))
            }
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
              settings.learningMode === "direct"
                ? "border-dayhoff-purple bg-dayhoff-purple/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-dayhoff-purple" />
            <div>
              <div className="font-semibold text-white">Direct Mode</div>
              <div className="mt-1 text-xs text-gray-400">
                AI gives answers directly with explanations — faster for
                experienced users.
              </div>
            </div>
          </button>
        </div>
      </section>
      </FadeIn>

      {/* Learning Style */}
      <FadeIn delay={0.1}>
      <section className="space-y-3 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6">
        <h2 className="text-lg font-semibold text-white">Learning Style</h2>
        <p className="text-sm text-gray-400">
          Choose how module content and AI responses are adapted to your
          learning preferences.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() =>
              setSettings((s) => ({ ...s, learnerType: "HANDS_ON" }))
            }
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
              settings.learnerType === "HANDS_ON"
                ? "border-dayhoff-emerald bg-dayhoff-emerald/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-dayhoff-emerald" />
            <div>
              <div className="font-semibold text-white">Learn by Doing</div>
              <div className="mt-1 text-xs text-gray-400">
                Prioritizes hands-on exercises, practical steps, and real
                experiments over theory.
              </div>
            </div>
          </button>
          <button
            onClick={() =>
              setSettings((s) => ({ ...s, learnerType: "CONCEPTUAL" }))
            }
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
              settings.learnerType === "CONCEPTUAL"
                ? "border-blue-400 bg-blue-400/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
            <div>
              <div className="font-semibold text-white">Theory First</div>
              <div className="mt-1 text-xs text-gray-400">
                Focuses on algorithmic details, comparisons between approaches,
                and conceptual depth.
              </div>
            </div>
          </button>
          <button
            onClick={() =>
              setSettings((s) => ({ ...s, learnerType: "ASSESSMENT" }))
            }
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
              settings.learnerType === "ASSESSMENT"
                ? "border-dayhoff-amber bg-dayhoff-amber/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-dayhoff-amber" />
            <div>
              <div className="font-semibold text-white">Test My Knowledge</div>
              <div className="mt-1 text-xs text-gray-400">
                Emphasizes quizzes, knowledge checks, and key points to
                remember.
              </div>
            </div>
          </button>
          <button
            onClick={() =>
              setSettings((s) => ({ ...s, learnerType: "EXPLORATORY" }))
            }
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
              settings.learnerType === "EXPLORATORY"
                ? "border-dayhoff-purple bg-dayhoff-purple/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-dayhoff-purple" />
            <div>
              <div className="font-semibold text-white">Ask & Discover</div>
              <div className="mt-1 text-xs text-gray-400">
                Suggests follow-up questions, connects to broader themes, and
                provides jumping-off points.
              </div>
            </div>
          </button>
        </div>
      </section>
      </FadeIn>

      {/* API Key */}
      <FadeIn delay={0.15}>
      <section className="space-y-3 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6">
        <h2 className="text-lg font-semibold text-white">API Key</h2>
        <p className="text-sm text-gray-400">
          Your API key is encrypted and stored securely. Get one from{" "}
          <a
            href="https://platform.claude.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dayhoff-purple hover:underline"
          >
            console.anthropic.com
          </a>.
        </p>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showApiKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </section>
      </FadeIn>

      {/* Model Selection */}
      <FadeIn delay={0.2}>
      <section className="space-y-3 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6">
        <h2 className="text-lg font-semibold text-white">Model</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() =>
                setSettings((s) => ({ ...s, modelId: model.id }))
              }
              className={`relative rounded-lg border p-4 text-left transition-all ${
                settings.modelId === model.id
                  ? "border-dayhoff-purple bg-dayhoff-purple/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              {model.badge && (
                <span className="absolute -top-2 right-3 rounded-full bg-dayhoff-purple px-2 py-0.5 text-[10px] font-semibold text-white">
                  {model.badge}
                </span>
              )}
              <div className="font-semibold text-white">{model.name}</div>
              <div className="mt-1 text-xs text-gray-400">
                {model.inputPrice} / {model.outputPrice} per MTok
              </div>
            </button>
          ))}
        </div>
      </section>
      </FadeIn>

      {/* AI Behavior & Personality */}
      <FadeIn delay={0.25}>
        <BehaviorSection settings={settings} setSettings={setSettings} />
      </FadeIn>

    </div>
  );
}
