"use client";

import { useState, useEffect, useCallback } from "react";
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
};

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
      <div>
        <h1 className="text-2xl font-bold text-white">AI Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Configure your Anthropic API connection and model preferences.
        </p>
      </div>

      {/* API Key */}
      <section className="space-y-3 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6">
        <h2 className="text-lg font-semibold text-white">API Key</h2>
        <p className="text-sm text-gray-400">
          Your API key is encrypted and stored securely. Get one from{" "}
          <span className="text-dayhoff-purple">console.anthropic.com</span>.
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

      {/* Model Selection */}
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

      {/* Inference Parameters */}
      <section className="space-y-5 rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-6">
        <h2 className="text-lg font-semibold text-white">
          Inference Parameters
        </h2>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Temperature</label>
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
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                temperature: parseFloat(e.target.value),
              }))
            }
            className="slider w-full accent-dayhoff-purple"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Max Tokens</label>
            <span className="text-sm font-semibold text-dayhoff-purple">
              {settings.maxTokens.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="256"
            max="8192"
            step="256"
            value={settings.maxTokens}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                maxTokens: parseInt(e.target.value),
              }))
            }
            className="w-full accent-dayhoff-purple"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>256</span>
            <span>8,192</span>
          </div>
        </div>

        {/* Top P */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Top P</label>
            <span className="text-sm font-semibold text-dayhoff-purple">
              {settings.topP.toFixed(2)}
            </span>
          </div>
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
        </div>

        {/* Top K */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Top K</label>
            <span className="text-sm font-semibold text-dayhoff-purple">
              {settings.topK}
            </span>
          </div>
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
            <span>100</span>
          </div>
        </div>
      </section>

      {/* Learning Preference */}
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

      {/* Actions */}
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

      {/* Test Result */}
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

      {/* Save Message */}
      {saveMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-dayhoff-purple/30 bg-dayhoff-purple/10 p-3 text-sm text-dayhoff-purple">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {saveMessage}
        </div>
      )}
    </div>
  );
}
