"use client";

import Link from "next/link";
import FadeIn from "@/components/motion/FadeIn";
import DayhoffLogo from "@/components/brand/DayhoffLogo";

/* ────────────────────────────────────────────
   Reusable section wrapper
   ──────────────────────────────────────────── */
function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-24 sm:py-32 ${className}`}>{children}</section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
      style={{
        background: "linear-gradient(to right, #7BE7FF, #C9A7FF)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
  );
}

/* ────────────────────────────────────────────
   Diagram: Three-Axis Composition
   ──────────────────────────────────────────── */
function ThreeAxisDiagram() {
  return (
    <div className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-7">
      {/* Three axes as compact inline rows */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-dayhoff-purple">Mode</span>
          <div className="flex flex-wrap gap-1.5">
            {["Socratic", "Direct"].map((o) => (
              <span key={o} className="rounded-full border border-dayhoff-purple/25 bg-dayhoff-purple/10 px-2.5 py-0.5 text-[11px] text-gray-300">{o}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-dayhoff-pink">Skill</span>
          <div className="flex flex-wrap gap-1.5">
            {["Novice", "Intermediate", "Advanced"].map((o) => (
              <span key={o} className="rounded-full border border-dayhoff-pink/25 bg-dayhoff-pink/10 px-2.5 py-0.5 text-[11px] text-gray-300">{o}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-dayhoff-emerald">Type</span>
          <div className="flex flex-wrap gap-1.5">
            {["Hands-On", "Theory First", "Test Me", "Ask & Discover"].map((o) => (
              <span key={o} className="rounded-full border border-dayhoff-emerald/25 bg-dayhoff-emerald/10 px-2.5 py-0.5 text-[11px] text-gray-300">{o}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Single example */}
      <div className="mt-5 flex items-start gap-3 border-t border-white/[0.04] pt-5">
        <span className="mt-0.5 text-[10px] text-gray-600">e.g.</span>
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-dayhoff-purple/15 px-2 py-0.5 text-[10px] font-medium text-dayhoff-purple">Socratic</span>
            <span className="text-[9px] text-gray-600">&times;</span>
            <span className="rounded-full bg-dayhoff-pink/15 px-2 py-0.5 text-[10px] font-medium text-dayhoff-pink">Novice</span>
            <span className="text-[9px] text-gray-600">&times;</span>
            <span className="rounded-full bg-dayhoff-emerald/15 px-2 py-0.5 text-[10px] font-medium text-dayhoff-emerald">Hands-On</span>
            <span className="text-[9px] text-gray-600">=</span>
            <span className="text-[10px] font-medium text-gray-300">guided exercises with everyday analogies</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-gray-500">
        <span className="font-mono font-semibold text-white">2 &times; 3 &times; 4 = 24</span> unique profiles — zero configuration.
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────
   Diagram: Pipeline Comparison
   ──────────────────────────────────────────── */
function PipelineComparison() {
  return (
    <div className="mt-14 grid gap-6 sm:grid-cols-2">
      {/* Black-box pipeline */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Traditional Pipeline
        </p>
        <div className="flex flex-col items-center gap-3">
          {[
            { label: "Submit Data", sub: "FASTA file uploaded", color: "bg-gray-700" },
            { label: "Click Run", sub: "Parameters auto-selected", color: "bg-gray-700" },
            { label: "Get Results", sub: "Numbers with no context", color: "bg-gray-700" },
          ].map((step, i) => (
            <div key={step.label} className="w-full">
              <div className={`rounded-lg ${step.color} px-4 py-3 text-center`}>
                <p className="text-sm font-medium text-gray-300">{step.label}</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{step.sub}</p>
              </div>
              {i < 2 && (
                <div className="flex justify-center py-1">
                  <svg width="12" height="16" viewBox="0 0 12 16" className="text-gray-600">
                    <path d="M6 0v12M2 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/[0.04] px-4 py-2.5 text-center">
            <p className="text-[11px] font-medium text-red-400/80">
              No reasoning visible
            </p>
            <p className="mt-0.5 text-[10px] text-gray-500">
              User learns buttons, not biology
            </p>
          </div>
        </div>
      </div>

      {/* Dayhoff pipeline */}
      <div className="rounded-2xl border border-dayhoff-purple/20 bg-dayhoff-purple/[0.02] p-6 sm:p-8">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-dayhoff-purple">
          Dayhoff Pipeline
        </p>
        <div className="flex flex-col items-center gap-3">
          {[
            { label: "Articulate Goal", sub: "Describe research intent", color: "bg-dayhoff-purple/10 border border-dayhoff-purple/20" },
            { label: "Reason About Design", sub: "Choose frameworks, evaluate trade-offs", color: "bg-dayhoff-purple/10 border border-dayhoff-purple/20" },
            { label: "Compose Workflow", sub: "Connect modules, understand data flow", color: "bg-dayhoff-purple/10 border border-dayhoff-purple/20" },
            { label: "Interpret Results", sub: "pLDDT, recovery rates — with context", color: "bg-dayhoff-purple/10 border border-dayhoff-purple/20" },
            { label: "Reflect & Transfer", sub: "Why did this work? What would I change?", color: "bg-dayhoff-purple/10 border border-dayhoff-purple/20" },
          ].map((step, i) => (
            <div key={step.label} className="w-full">
              <div className={`rounded-lg ${step.color} px-4 py-3 text-center`}>
                <p className="text-sm font-medium text-white">{step.label}</p>
                <p className="mt-0.5 text-[10px] text-gray-400">{step.sub}</p>
              </div>
              {i < 4 && (
                <div className="flex items-center justify-center gap-2 py-1">
                  <svg width="12" height="16" viewBox="0 0 12 16" className="text-dayhoff-purple/40">
                    <path d="M6 0v12M2 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[9px] italic text-dayhoff-purple/50">
                    reasoning shown
                  </span>
                </div>
              )}
            </div>
          ))}
          <div className="mt-4 rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/[0.04] px-4 py-2.5 text-center">
            <p className="text-[11px] font-medium text-dayhoff-emerald/80">
              Transferable understanding
            </p>
            <p className="mt-0.5 text-[10px] text-gray-500">
              User learns to think computationally
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Diagram: 5-Session Progression
   ──────────────────────────────────────────── */
function FiveSessionDiagram() {
  const sessions = [1, 2, 3, 4, 5];
  const blackBoxLevels = [12, 18, 22, 24, 25]; // procedural plateau
  const dayhoffLevels = [10, 25, 45, 68, 90]; // exponential understanding

  const maxVal = 100;
  const chartH = 180;
  const barW = 28;

  return (
    <div className="mt-14 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-10">
      <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
        Knowledge Growth Over 5 Sessions
      </p>
      <p className="mb-8 text-center text-[10px] text-gray-600">
        Procedural memory vs. transferable understanding
      </p>

      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {sessions.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-2">
            {/* Bars */}
            <div className="flex items-end gap-1.5" style={{ height: chartH }}>
              {/* Black-box bar */}
              <div
                className="w-[14px] rounded-t-sm bg-gray-600/50 sm:w-[16px]"
                style={{
                  height: `${(blackBoxLevels[i] / maxVal) * chartH}px`,
                }}
              />
              {/* Dayhoff bar */}
              <div
                className="w-[14px] rounded-t-sm sm:w-[16px]"
                style={{
                  height: `${(dayhoffLevels[i] / maxVal) * chartH}px`,
                  background:
                    "linear-gradient(to top, #8b5cf6, #7BE7FF)",
                }}
              />
            </div>
            {/* Session label */}
            <span className="text-[10px] text-gray-500">{s}</span>
          </div>
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="mt-2 flex justify-center gap-1 text-[10px] text-gray-600">
        <span>Sessions</span>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-6 text-[11px]">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-6 rounded-sm bg-gray-600/50" />
          <span className="text-gray-500">Black-box pipeline</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-6 rounded-sm"
            style={{ background: "linear-gradient(to right, #8b5cf6, #7BE7FF)" }}
          />
          <span className="text-gray-400">Dayhoff</span>
        </div>
      </div>

      {/* Annotations */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-800/30 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Black-box after 5 sessions
          </p>
          <p className="mt-1 text-xs text-gray-400">
            &ldquo;I submit X, I get Y. I click these buttons in this
            order.&rdquo;
          </p>
        </div>
        <div className="rounded-lg border border-dayhoff-purple/10 bg-dayhoff-purple/[0.03] px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-dayhoff-purple">
            Dayhoff after 5 sessions
          </p>
          <p className="mt-1 text-xs text-gray-300">
            Pipeline reasoning, metric interpretation, tool selection, failure
            modes, and transferable design thinking.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Page
   ──────────────────────────────────────────── */
export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-dayhoff-bg-primary text-gray-300">
      {/* ── Background effects ── */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[20%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
            animation: "drift 14s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute left-[60%] top-[60%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 60%)",
            animation: "drift 18s ease-in-out infinite alternate-reverse",
          }}
        />
      </div>

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Nav bar ── */}
      <nav className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 pt-8">
        <Link
          href="/"
          className="text-sm font-semibold text-gray-400 transition-colors hover:text-white"
        >
          &larr; Back
        </Link>
      </nav>

      {/* ── Hero ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-20 sm:pt-28">
        <FadeIn delay={0} duration={0.7}>
          <DayhoffLogo className="text-5xl sm:text-6xl lg:text-7xl" />
        </FadeIn>
        <FadeIn delay={0.15} duration={0.6}>
          <p className="mt-6 text-lg text-gray-500 sm:text-xl">
            Design Rationale&ensp;·&ensp;Paul Mangiamele, PhD
          </p>
        </FadeIn>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        {/* ═══════════════════════════════════════
           THE PROBLEM
           ═══════════════════════════════════════ */}
        <Section>
          <FadeIn>
            <SectionLabel>The Problem</SectionLabel>
            <blockquote className="mb-10 border-l-2 border-dayhoff-purple/40 pl-5 text-xl font-medium italic leading-relaxed text-white sm:text-2xl">
              &ldquo;The goal is not to have AI do the science for us. The goal
              is to have AI make us better scientists.&rdquo;
            </blockquote>
            <p className="text-xs uppercase tracking-widest text-gray-600">
              Neurobiology PI&ensp;·&ensp;Harvard Medical School
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-10 text-base leading-relaxed sm:text-lg">
              Accelerated drug development depends on bench scientists being able
              to reason computationally — but the tools designed to help them
              were built by computational people, for computational people. The
              result: biologists work{" "}
              <em className="text-white">around</em> their bioinformatics tools,
              not <em className="text-white">with</em> them.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="mt-6 text-base leading-relaxed sm:text-lg">
              I&rsquo;ve studied this gap for over a decade. My PhD thesis,{" "}
              <span className="text-gray-200">
                &ldquo;From Sequencing to Analysis: Building a Comparative
                Genomics Tool for the Biologist End-User&rdquo;
              </span>{" "}
              (Iowa State University, 2014), sits at the intersection of
              computational biology and HCI. That work produced 700+ citations
              and a conviction I&rsquo;ve carried through 7 years building
              clinical genomics tools at Roche (10,000+ clinicians) and 90+
              user-research interviews with drug-discovery scientists at
              Stanford, Harvard, GSK, and Takeda.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-6 text-base leading-relaxed sm:text-lg">
              The consistent finding:{" "}
              <span className="font-semibold text-white">
                scientists don&rsquo;t want AI confidence — they want
                defensibility.
              </span>{" "}
              They need to understand <em>why</em> a recommendation was made so
              they can defend it to PIs, teams, and reviewers. Black-box tools
              that output answers without reasoning create dependency. Tools that
              show their reasoning create scientists who can think
              computationally on their own.
            </p>
          </FadeIn>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════
           THE SOLUTION
           ═══════════════════════════════════════ */}
        <Section>
          <FadeIn>
            <SectionLabel>The Solution</SectionLabel>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
              A bioinformatics learning workbench where bench scientists design
              antibody candidates through AI-collaborative workflows — learning
              computational reasoning in the process.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-8 text-base leading-relaxed sm:text-lg">
              Named after{" "}
              <span className="font-semibold text-white">
                Margaret Dayhoff
              </span>
              , the mother of bioinformatics, it transforms what is typically a
              submit-job-get-results pipeline into a scaffolded learning
              experience.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="mt-6 text-base leading-relaxed sm:text-lg">
              A scientist using Dayhoff doesn&rsquo;t just generate 100 antibody
              candidates. They learn{" "}
              <em className="text-white">why those candidates were ranked</em>,
              what trade-offs were made, and how to reason about the design space
              differently next time.
            </p>
          </FadeIn>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════
           THREE-AXIS DESIGN
           ═══════════════════════════════════════ */}
        <Section>
          <FadeIn>
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
              Three independent axes that compose to produce pedagogically
              appropriate responses for every interaction.
            </h2>
          </FadeIn>

          <div className="mt-14 space-y-12">
            <FadeIn delay={0.1}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-dayhoff-purple">
                  Axis 1 — Learning Mode
                </p>
                <p className="text-sm font-medium text-white">User-selected</p>
                <p className="mt-3 text-sm leading-relaxed">
                  Socratic (guided discovery) vs. Direct (efficient answers).
                  Five persona prompts — conceptExplainer, directExplainer,
                  workflowMentor, resultsInterpreter, socraticGuide — are
                  selected by context.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-dayhoff-pink">
                  Axis 2 — Skill Calibration
                </p>
                <p className="text-sm font-medium text-white">Auto-detected</p>
                <p className="mt-3 text-sm leading-relaxed">
                  The system tracks questions asked, concepts explored, quiz
                  scores, and exercises completed per module, then appends
                  skill-appropriate instructions to every prompt. A novice gets
                  everyday analogies. An advanced user gets implementation
                  details and recent literature.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-dayhoff-emerald">
                  Axis 3 — Learner Type
                </p>
                <p className="text-sm font-medium text-white">User-selected</p>
                <p className="mt-3 text-sm leading-relaxed">
                  Hands-On, Theory First, Test My Knowledge, or Ask &amp;
                  Discover. This reshapes not just how Claude responds, but how
                  the UI organizes content — section ordering, quiz difficulty,
                  and exercise surfacing all adapt.
                </p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.25}>
            <ThreeAxisDiagram />
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-10 rounded-lg border border-dayhoff-purple/20 bg-dayhoff-purple/[0.04] p-5 text-sm leading-relaxed text-gray-300">
              A{" "}
              <span className="font-medium text-white">
                Hands-On Intermediate
              </span>{" "}
              user in Socratic mode gets a fundamentally different experience
              than a{" "}
              <span className="font-medium text-white">
                Conceptual Novice
              </span>{" "}
              in Direct mode — without any manual configuration at the point of
              interaction.
            </p>
          </FadeIn>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════
           REASONING & DECISIONS
           ═══════════════════════════════════════ */}
        <Section>
          <FadeIn>
            <SectionLabel>Transparent Reasoning</SectionLabel>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
              Dayhoff surfaces reasoning at every decision point and preserves
              interpretive authority.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-8 text-base leading-relaxed sm:text-lg">
              Traditional bioinformatics pipelines break the action-reflection
              loop essential to expertise development — users submit data, click
              &ldquo;Run,&rdquo; and receive results without understanding the
              reasoning that produced them.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <PipelineComparison />
          </FadeIn>

          <div className="mt-12 space-y-6">
            {[
              {
                title: "Module connection annotations",
                body: "Connecting RFdiffusion → ProteinMPNN on the workflow canvas doesn't just draw an arrow — it explains the data flow between backbone generation (PDB) and sequence design (FASTA). Incompatible connections explain the gap rather than showing a generic error.",
              },
              {
                title: "Socratic workflow composition",
                body: 'When the AI designs a pipeline, it returns a Socratic question — "What would happen if you skipped the ESMFold validation step?" — before finalizing. The user must reason about the pipeline, not just accept it.',
              },
              {
                title: "Accuracy metrics in context",
                body: "Real performance data injected into every conversation — ProteinMPNN: ~95% sequence recovery. ESMFold: ~91% accuracy (pLDDT > 70). The AI references concrete numbers, not abstractions.",
              },
              {
                title: "Published case studies in AI responses",
                body: "Each module's Q&A injects real papers into the system prompt, so Claude references actual published results rather than generic descriptions.",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={0.1 + i * 0.05}>
                <div className="flex gap-4">
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-dayhoff-purple/60" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.35}>
            <h3 className="mt-16 text-lg font-semibold text-white">
              Decisions the user makes that a pipeline would automate away
            </h3>
          </FadeIn>

          <div className="mt-8 space-y-6">
            {[
              {
                title: "Antibody framework selection",
                body: "The user chooses between IgG1 (effector functions), IgG4 (reduced effector function), or VHH Nanobody (single-domain, accesses cryptic epitopes). A pipeline defaults to IgG1. Dayhoff forces the user to think about why.",
              },
              {
                title: "Hotspot region selection",
                body: "The user selects which binding regions to target on the antigen, with the chat available to explain what each region does. A pipeline auto-detects hotspots or requires a config file — no reasoning involved.",
              },
              {
                title: "Workflow assembly",
                body: 'The user drags modules onto a canvas and connects them. Each connection is validated with scientific explanations. "My structure generator outputs PDB, but my sequence optimizer needs FASTA, so I need an inverse folding step."',
              },
              {
                title: "Research goal articulation",
                body: "The experiment wizard asks the user to describe their goal in natural language before recommending a workflow. The AI returns a confidence score and alternatives. The user sees why the recommendation was made.",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={0.4 + i * 0.05}>
                <div className="flex gap-4">
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-dayhoff-emerald/60" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════
           HUMAN AGENCY
           ═══════════════════════════════════════ */}
        <Section>
          <FadeIn>
            <SectionLabel>Human Agency</SectionLabel>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
              Cognitive scaffolding, not cognitive replacement.
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-8 text-base leading-relaxed sm:text-lg">
              The design implements what Clark &amp; Chalmers call
              &ldquo;cognitive scaffolding&rdquo; in their extended mind
              framework. Where black-box AI constitutes a form of offloading
              that diminishes the user&rsquo;s cognitive authority, Dayhoff{" "}
              <span className="text-white">
                extends the scientist&rsquo;s reasoning capacity while keeping
                them in the driver&rsquo;s seat.
              </span>
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="mt-6 text-base leading-relaxed sm:text-lg">
              By making every AI recommendation accompanied by its reasoning
              chain, uncertainty estimates, and alternatives, Dayhoff maintains
              what&rsquo;s critical for agency —{" "}
              <span className="text-white">
                interpretive flexibility and metacognitive awareness.
              </span>{" "}
              Scientists don&rsquo;t just learn which buttons to press; they
              develop transferable understanding of pipeline design, format
              compatibility, and tool selection that applies beyond any single
              interface.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-8 rounded-lg border border-dayhoff-emerald/20 bg-dayhoff-emerald/[0.04] p-5 text-sm font-medium leading-relaxed text-gray-200">
              Dayhoff is designed around a principle: the user should graduate
              from the tool.
            </p>
          </FadeIn>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════
           LEARNING PRINCIPLES
           ═══════════════════════════════════════ */}
        <Section>
          <FadeIn>
            <SectionLabel>Learning Principles</SectionLabel>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
              Grounded in established learning science.
            </h2>
          </FadeIn>

          <div className="mt-12 space-y-10">
            {[
              {
                name: "Situated Cognition",
                cite: "Lave & Wenger, 1991",
                text: "Knowledge isn't just constructed individually but emerges through participation in authentic practices within communities. Learning is legitimate peripheral participation.",
              },
              {
                name: "Cognitive Scaffolding vs. Replacement",
                cite: "Clark & Chalmers, 1998",
                text: "Tools that extend reasoning capacity while keeping the user in control (scaffolding) vs. those that offload cognition in ways that diminish authority (replacement). Dayhoff implements scaffolding — support fades as competence grows.",
              },
              {
                name: "Scaffolded Fading",
                cite: "Wood, Bruner & Ross, 1976",
                text: "Support structures are gradually removed as competence develops. The same principle behind Vygotsky's Zone of Proximal Development — the system meets the learner where they are and incrementally raises the bar.",
              },
              {
                name: "Constructivism",
                cite: "Piaget, 1970",
                text: 'Learners build knowledge through active engagement, not passive reception. Socratic mode operationalizes this — Claude asks "what do you think should come next?" before providing its recommendation.',
              },
              {
                name: "Metacognitive Awareness",
                cite: "Flavell, 1979",
                text: "The learning dashboard surfaces patterns in the user's own decision-making — concepts explored, questions asked, skill progression over time. Scientists learn not just what to decide, but how they decide.",
              },
              {
                name: "Differentiated Instruction",
                cite: "Tomlinson, 2001",
                text: "The three-axis prompt system produces individualized instruction at scale without manual configuration — the same principle that drives effective classroom differentiation, implemented computationally.",
              },
            ].map((p, i) => (
              <FadeIn key={p.name} delay={0.05 + i * 0.05}>
                <div>
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{p.cite}</p>
                  <p className="mt-2 text-sm leading-relaxed">{p.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════
           MEASURING SUCCESS
           ═══════════════════════════════════════ */}
        <Section>
          <FadeIn>
            <SectionLabel>Measuring Success</SectionLabel>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
              The 5-Session Test
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-8 text-base leading-relaxed sm:text-lg">
              After 5 sessions with a black-box pipeline tool, a user knows:{" "}
              <span className="text-gray-500">
                &ldquo;I submit X, I get Y. I click these buttons in this
                order.&rdquo;
              </span>{" "}
              They have procedural knowledge of one interface.
            </p>
          </FadeIn>

          <FadeIn delay={0.12}>
            <FiveSessionDiagram />
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="mt-10 text-base leading-relaxed text-white sm:text-lg">
              After 5 sessions with Dayhoff, a user knows:
            </p>
          </FadeIn>

          <div className="mt-8 space-y-5">
            {[
              {
                label: "Why the pipeline is ordered the way it is",
                detail:
                  "Not just \"RFdiffusion then ProteinMPNN then AlphaFold2\" but that you generate backbones, design sequences to fold into them, then validate the sequences actually fold correctly. They know what happens if you skip validation.",
              },
              {
                label: "What the output numbers mean",
                detail:
                  "pLDDT > 70 means confident structure prediction. ~95% sequence recovery means ProteinMPNN is likely to produce foldable sequences. A black-box user sees these numbers but doesn't know if 70 is good or bad.",
              },
              {
                label: "When to use which tool",
                detail:
                  "ESMFold for fast screening, AlphaFold2 for final validation. IgG1 when you want effector functions, VHH for tight binding pockets.",
              },
              {
                label: "What can go wrong and why",
                detail:
                  "\"Unconstrained generation produces valid but random folds\" is knowledge you'd only get from experience or mentorship.",
              },
              {
                label: "How to design a new pipeline for a new problem",
                detail:
                  "Because they've reasoned about data flow, format compatibility, and module capabilities rather than memorizing button sequences.",
              },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={0.2 + i * 0.04}>
                <div className="flex gap-4">
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-dayhoff-amber/60" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <p className="mt-10 text-sm leading-relaxed text-gray-500">
              What I&rsquo;d avoid measuring: task completion speed. Faster
              isn&rsquo;t better if the user learned nothing. Dayhoff optimizes
              for{" "}
              <span className="text-gray-300">understanding velocity</span>, not
              task velocity.
            </p>
          </FadeIn>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════
           SCALING
           ═══════════════════════════════════════ */}
        <Section>
          <FadeIn>
            <SectionLabel>How This Scales</SectionLabel>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
              The learning model is domain-agnostic. The architecture
              generalizes.
            </h2>
          </FadeIn>

          <div className="mt-12 space-y-8">
            <FadeIn delay={0.1}>
              <div>
                <p className="text-sm font-semibold text-white">
                  Within bioinformatics
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  The module catalog is extensible. Adding a new computational
                  method (CRISPR design, single-cell analysis, molecular
                  dynamics) means adding module metadata with learning content.
                  The prompt composition system, skill tracking, and adaptive UI
                  work unchanged.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div>
                <p className="text-sm font-semibold text-white">
                  Across scientific domains
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  The same pattern — &ldquo;AI collaborator that shows
                  reasoning, admits uncertainty, adapts to your level, and
                  teaches while doing&rdquo; — applies to clinical trial design,
                  materials science, genomic analysis, synthetic chemistry.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <p className="text-sm font-semibold text-white">
                  Beyond science
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  The underlying model — scaffolded AI collaboration that builds
                  human expertise — applies to programming education, legal
                  reasoning, financial analysis, or any field where practitioners
                  need to develop judgment, not just complete tasks.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              <div>
                <p className="text-sm font-semibold text-white">
                  Technical scalability
                </p>
                <p className="mt-2 text-sm leading-relaxed">
                  Stateless prompt composition (mode &times; skill &times;
                  learner type) means personalization requires no model
                  fine-tuning — just database lookups and string concatenation.
                  This scales horizontally with standard web infrastructure.
                </p>
              </div>
            </FadeIn>
          </div>
        </Section>

        <Divider />

        {/* ═══════════════════════════════════════
           CLOSING
           ═══════════════════════════════════════ */}
        <Section>
          <FadeIn>
            <blockquote className="text-xl font-medium italic leading-relaxed text-white sm:text-2xl">
              &ldquo;The goal is not to have AI do the science for us. The goal
              is to have AI make us better scientists.&rdquo;
            </blockquote>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-14 flex flex-wrap gap-4">
              <Link
                href="/"
                className="rounded-xl bg-dayhoff-purple px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110"
              >
                Try Dayhoff
              </Link>
            </div>
          </FadeIn>
        </Section>

        <div className="pb-16 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} The Dayhoff Project
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style jsx>{`
        @keyframes drift {
          0% {
            transform: translate(-50%, -50%) translate(0px, 0px);
          }
          100% {
            transform: translate(-50%, -50%) translate(30px, -20px);
          }
        }
      `}</style>
    </div>
  );
}
