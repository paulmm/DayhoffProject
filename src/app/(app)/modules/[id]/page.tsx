"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getModuleById, MODULE_CATALOG } from "@/data/modules-catalog";
import { getCaseStudiesForModule } from "@/data/module-case-studies";
import CaseStudyCard from "@/components/learning/CaseStudyCard";
import ApplyKnowledgeSection from "@/components/learning/ApplyKnowledgeSection";
import SkillLevelUpToast from "@/components/learning/SkillLevelUpToast";
import {
  ArrowLeft,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Send,
  Loader2,
  Cpu,
  Clock,
  FileInput,
  FileOutput,
  Sparkles,
  GraduationCap,
  MessageCircle,
  FlaskConical,
} from "lucide-react";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-dayhoff-emerald/10 text-dayhoff-emerald border-dayhoff-emerald/20",
  intermediate: "bg-dayhoff-amber/10 text-dayhoff-amber border-dayhoff-amber/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TYPE_COLORS: Record<string, string> = {
  foundation: "bg-dayhoff-purple/10 text-dayhoff-purple border-dayhoff-purple/20",
  specialized: "bg-dayhoff-pink/10 text-dayhoff-pink border-dayhoff-pink/20",
  tool: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const SKILL_COLORS: Record<string, string> = {
  NOVICE: "text-gray-400 border-gray-500/30 bg-gray-500/10",
  BEGINNER: "text-dayhoff-amber border-dayhoff-amber/30 bg-dayhoff-amber/10",
  INTERMEDIATE: "text-dayhoff-purple border-dayhoff-purple/30 bg-dayhoff-purple/10",
  ADVANCED: "text-dayhoff-emerald border-dayhoff-emerald/30 bg-dayhoff-emerald/10",
};

export default function ModuleDetailPage() {
  const params = useParams();
  const mod = getModuleById(params.id as string);
  const caseStudies = mod ? getCaseStudiesForModule(mod.id) : [];

  const [whyExpanded, setWhyExpanded] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [skillLevel, setSkillLevel] = useState<string>("NOVICE");
  const [levelUp, setLevelUp] = useState<string | null>(null);

  // Fire-and-forget tracking helper
  const track = useCallback(
    (action: string, topic?: string) => {
      if (!mod) return;
      fetch(`/api/modules/${mod.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, topic }),
      }).catch(() => {});
    },
    [mod]
  );

  // Track page visit on mount
  useEffect(() => {
    if (mod) {
      track("visited");
    }
  }, [mod, track]);

  if (!mod) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <p className="text-gray-400">Module not found</p>
        <Link
          href="/modules"
          className="text-sm text-dayhoff-purple hover:underline"
        >
          Back to modules
        </Link>
      </div>
    );
  }

  const suggestedQuestions = [
    `How does ${mod.displayName} compare to alternatives?`,
    `When would I NOT use ${mod.displayName}?`,
    `Explain the key concept like I'm a chemistry grad student`,
  ];

  const toggleTopic = (idx: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
        track("expandedDeepDive", mod.learning.deepDiveTopics[idx]);
      }
      return next;
    });
  };

  const handleAsk = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`/api/modules/${mod.id}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || data.error || "No response" },
      ]);
      if (data.skillLevelUp) {
        setSkillLevel(data.skillLevelUp);
        setLevelUp(data.skillLevelUp);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get response. Check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const prereqModules = mod.learning.prerequisites.map((p) => {
    const found = MODULE_CATALOG.find(
      (m) =>
        m.displayName.toLowerCase() === p.toLowerCase() ||
        m.id === p.toLowerCase()
    );
    return { text: p, linkedModule: found };
  });

  return (
    <div className="flex h-full">
      {/* Level-up toast */}
      <SkillLevelUpToast level={levelUp} onDismiss={() => setLevelUp(null)} />

      {/* Left Column (60%) */}
      <div className="flex-[3] overflow-y-auto p-8">
        <Link
          href="/modules"
          className="mb-6 flex items-center gap-1 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to modules
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${TYPE_COLORS[mod.type]}`}>
              {mod.type}
            </span>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold capitalize text-gray-400">
              {mod.category}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${DIFFICULTY_COLORS[mod.learning.difficulty]}`}>
              {mod.learning.difficulty}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${SKILL_COLORS[skillLevel]}`}>
              {skillLevel}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-white">
            {mod.displayName}
          </h1>
          <p className="mt-2 text-gray-400">{mod.description}</p>
        </div>

        {/* Learn Section */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <GraduationCap className="h-5 w-5 text-dayhoff-emerald" />
            Learn
          </div>

          {/* Concept Summary */}
          <div className="rounded-xl border border-white/10 bg-dayhoff-bg-secondary p-5">
            <p className="text-sm leading-relaxed text-gray-300">
              {mod.learning.conceptSummary}
            </p>
            <button
              onClick={() => {
                const wasExpanded = whyExpanded;
                setWhyExpanded(!wasExpanded);
                if (!wasExpanded) track("expandedWhyItMatters");
              }}
              className="mt-3 flex items-center gap-1 text-sm font-semibold text-dayhoff-purple hover:underline"
            >
              {whyExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Why It Matters
            </button>
            {whyExpanded && (
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {mod.learning.whyItMatters}
              </p>
            )}
          </div>

          {/* Key Insight */}
          <div className="flex gap-3 rounded-xl border border-dayhoff-emerald/20 bg-dayhoff-emerald/5 p-5">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-dayhoff-emerald" />
            <div>
              <div className="text-sm font-semibold text-dayhoff-emerald">Key Insight</div>
              <p className="mt-1 text-sm leading-relaxed text-gray-300">
                {mod.learning.keyInsight}
              </p>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-300">Prerequisites</div>
            <div className="flex flex-wrap gap-2">
              {prereqModules.map((p, i) =>
                p.linkedModule ? (
                  <Link
                    key={i}
                    href={`/modules/${p.linkedModule.id}`}
                    className="rounded-lg border border-dayhoff-purple/20 bg-dayhoff-purple/10 px-3 py-1.5 text-xs font-semibold text-dayhoff-purple hover:bg-dayhoff-purple/20"
                  >
                    {p.text}
                  </Link>
                ) : (
                  <span
                    key={i}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400"
                  >
                    {p.text}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="flex gap-3 rounded-xl border border-dayhoff-amber/20 bg-dayhoff-amber/5 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-dayhoff-amber" />
            <div>
              <div className="text-sm font-semibold text-dayhoff-amber">Common Mistakes</div>
              <ul className="mt-2 space-y-2">
                {mod.learning.commonMistakes.map((mistake, i) => (
                  <li key={i} className="text-sm leading-relaxed text-gray-300">
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Deep Dive Topics */}
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-300">Deep Dive Topics</div>
            <div className="space-y-1">
              {mod.learning.deepDiveTopics.map((topic, i) => (
                <div key={i}>
                  <button
                    onClick={() => toggleTopic(i)}
                    className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10"
                  >
                    {expandedTopics.has(i) ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-dayhoff-purple" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
                    )}
                    {topic}
                  </button>
                  {expandedTopics.has(i) && (
                    <div className="ml-6 mt-1 mb-2 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                      <p className="text-xs text-gray-500">
                        This is an advanced topic. Ask Claude for a detailed explanation.
                      </p>
                      <button
                        onClick={() =>
                          handleAsk(`Explain "${topic}" in the context of ${mod.displayName}`)
                        }
                        className="mt-2 flex items-center gap-1 text-xs font-semibold text-dayhoff-purple hover:underline"
                      >
                        <MessageCircle className="h-3 w-3" /> Ask Claude about this
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Related Papers */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
              <BookOpen className="h-4 w-4" />
              Related Papers
            </div>
            <ul className="space-y-2">
              {mod.learning.relatedPapers.map((paper, i) => (
                <li key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-semibold text-white">{paper.title}</div>
                  <div className="mt-1 text-xs text-gray-400">{paper.citation}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Case Studies */}
          {caseStudies.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <FlaskConical className="h-4 w-4" />
                Real-World Case Studies
              </div>
              <div className="space-y-3">
                {caseStudies.map((cs, i) => (
                  <CaseStudyCard
                    key={i}
                    study={cs}
                    onView={() => track("viewedCaseStudy", cs.paperTitle)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Apply Your Knowledge */}
          <ApplyKnowledgeSection
            moduleId={mod.id}
            moduleName={mod.displayName}
            deepDiveTopics={mod.learning.deepDiveTopics}
            onLevelUp={(level) => {
              setSkillLevel(level);
              setLevelUp(level);
            }}
            onAsk={handleAsk}
            onTrack={track}
          />

          {/* Technical Specs */}
          <div className="mt-8">
            <div className="mb-3 text-lg font-bold text-white">Technical Specs</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FileInput className="h-3 w-3" /> Input
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {mod.inputFormats.join(", ")}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FileOutput className="h-3 w-3" /> Output
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {mod.outputFormats.join(", ")}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Cpu className="h-3 w-3" /> GPU
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {mod.computeRequirements.gpu ? "Required" : "Not required"}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" /> Time
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {mod.computeRequirements.timeEstimate}
                </div>
              </div>
            </div>

            {(mod.performance.accuracy || mod.performance.speed) && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {mod.performance.accuracy && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-gray-500">Accuracy</div>
                    <div className="mt-1 text-sm text-gray-300">{mod.performance.accuracy}</div>
                  </div>
                )}
                {mod.performance.speed && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-gray-500">Speed</div>
                    <div className="mt-1 text-sm text-gray-300">{mod.performance.speed}</div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex gap-4 text-xs text-gray-500">
              <span>v{mod.version}</span>
              <span>{mod.author}</span>
              <span>{mod.usageCount.toLocaleString()} uses</span>
              <span>{(mod.successRate * 100).toFixed(0)}% success</span>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column — Ask Claude Panel */}
      <div className="flex w-[400px] shrink-0 flex-col border-l border-white/10 bg-dayhoff-bg-secondary">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <Sparkles className="h-5 w-5 text-dayhoff-purple" />
          <span className="font-semibold text-white">Ask Claude</span>
          <span className="ml-auto text-xs text-gray-500">about {mod.displayName}</span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Ask anything about {mod.displayName}. Suggested questions:
              </p>
              {suggestedQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(sq)}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-left text-sm text-gray-300 hover:border-dayhoff-purple/30 hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-dayhoff-purple" />
                  {sq}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "ml-8 bg-dayhoff-purple/10 text-gray-200"
                  : "mr-4 bg-white/5 text-gray-300"
              }`}
            >
              <div className="mb-1 text-[10px] font-semibold uppercase text-gray-500">
                {msg.role === "user" ? "You" : "Claude"}
              </div>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 rounded-lg bg-white/5 p-3 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(question);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none focus:ring-1 focus:ring-dayhoff-purple"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="rounded-lg bg-dayhoff-purple p-2.5 text-white transition-colors hover:bg-dayhoff-purple/80 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
