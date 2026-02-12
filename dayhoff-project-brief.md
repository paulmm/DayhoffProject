# The Dayhoff Project
## A Bioinformatics Learning Workbench for AI-Collaborative Scientific Discovery

**Author:** Paul Mangiamele, PhD  
**Target:** Anthropic Education Labs — Take-Home Assignment  
**Build Tool:** Claude Code  

---

## 1. Executive Summary

Accelerated drug development isn't a nice-to-have — it's a moral imperative for scientists working with patients who are on the clock. The Dayhoff Project is a functional prototype that demonstrates how AI collaboration transforms bench scientists from tool-dependent operators into empowered, independent scientific thinkers.

Named after Margaret Dayhoff, the mother of bioinformatics, this workbench teaches users scientific workflows — specifically de novo antibody design — through structured collaboration with Claude. Rather than replacing expertise, Dayhoff builds it: every AI recommendation comes with transparent reasoning, literature citations, confidence scores, and explicit trade-offs, turning each interaction into a learning moment that develops domain mastery.

**The core thesis:** The best way to learn science is to *do* science — with an AI collaborator that shows its work, admits uncertainty, and scaffolds your understanding upward.

---

## 2. Origin Story: A Decade at This Intersection

This project didn't start with the Anthropic Education Labs prompt. It started in 2010, when I — a computer scientist, not a biologist — watched biology-first researchers get knee-capped by the very bioinformatic tools that were supposed to empower them. They weren't working *with* their tools. They were working *around* them.

To understand the problem deeply enough to solve it, I did something unusual: I became a publishing biologist. Not to switch fields, but to conduct an ethnographic study from inside the discipline — to feel the friction firsthand and map the pain points that software designers never see because they never sit at the bench.

My PhD thesis, *"From Sequencing to Analysis: Building a Comparative Genomics Tool for the Biologist End-User"* (Iowa State University, 2014), sits at the intersection of computational biology and human-computer interaction, addressing exactly this bottleneck: biologists who are experts in their science but underserved by tools designed by computational people for computational people. That work produced 700+ research citations and a conviction that has only deepened over the following decade — through 7 years building clinical genomics tools at Roche for 10,000+ clinicians, through 90+ user research interviews with drug discovery scientists at Stanford, Harvard, GSK, and Takeda, and through building Hodgkin as an AI-powered research tool validated with those same scientists.

The Dayhoff Project is the next evolution of that thesis: if the core problem is that biology-first users are locked out of computational reasoning, then the solution isn't better documentation or simpler UIs — it's an AI collaborator that *teaches you to think computationally by showing its own reasoning transparently.* The tools shouldn't just be easier to use. They should make you smarter every time you use them.

---

## 3. The Problem Space

### 3.1 The Bench Scientist's Reality

Bench scientists — the people physically running experiments in labs — face a persistent bottleneck: computational biology. To design antibody candidates, analyze structural data, or optimize experiment campaigns, they typically must:

- **Wait** for computational biologists (days to weeks for queue-dependent support)
- **Coordinate** across fragmented tools (molecular viewers, sequence editors, literature databases, Slack, email)
- **Translate** between their biological intuition and computational outputs they can't fully interrogate
- **Trust blindly** — most AI tools present results without reasoning, forcing scientists to either accept or reject without understanding

This creates a dependency loop where bench scientists can't develop computational intuitions because they never get hands-on with the reasoning process.

### 3.2 The Learning Gap

Current AI tools in drug discovery optimize for **output** (generate candidates, rank results, predict structures) but not for **understanding**. A scientist who uses a black-box tool to generate 100 antibody candidates hasn't learned why those candidates were ranked that way, what trade-offs were made, or how to reason about the design space differently next time.

**This is the gap Dayhoff fills:** transforming AI-assisted drug design from task completion into skill development.

---

## 4. The Dayhoff Learning Model

### 4.1 Design Philosophy: "Transparent Reasoning as Pedagogy"

Dayhoff's learning model is built on a principle validated across 90+ user interviews with drug discovery scientists at Stanford, Harvard, GSK, and Takeda: **scientists don't want confidence — they want defensibility.**

When a tool says "here's your answer," scientists learn nothing. When a tool says "here's my reasoning, here's my confidence, here's where I might be wrong, and here's the literature" — scientists learn to think computationally.

### 4.2 Three Learning Loops

**Loop 1: Guided Discovery (Scaffolded)**
The user follows a structured workflow — e.g., "Design an antibody against SARS-CoV-2 RBD" — with Claude as an active collaborator. At each step, Claude doesn't just execute; it *teaches*:

- "I'm recommending K417 as a hotspot. Here's why: [literature citation with DOI]. But there's a trade-off — targeting K417 may reduce thermal stability (Tm). Here's the evidence for that concern: [citation]. Alternative approach: N501Y offers broader coverage but lower affinity. What matters more for your campaign?"

The scientist isn't just clicking buttons. They're learning to reason about hotspot selection, trade-off analysis, and design space navigation.

**Loop 2: Progressive Independence (Fading Scaffolds)**
As the user completes more design cycles, Dayhoff progressively reduces hand-holding:

- **First run:** Full reasoning panels, step-by-step guidance, concept definitions inline
- **Third run:** Reasoning panels available on-demand (click to expand), guidance only at decision points
- **Fifth run:** Expert mode — Claude presents options and trade-offs concisely, user drives decisions, reasoning available but not foregrounded

This mirrors the pedagogical concept of *scaffolded fading* — support structures are gradually removed as competence develops.

**Loop 3: Reflective Practice (Campaign Intelligence)**
After completing design campaigns, Dayhoff surfaces patterns from the user's own work:

- "Across your last 3 campaigns, you consistently prioritized affinity over stability. Here's how that pattern compares to published approaches for similar targets. Would you like to explore a stability-first strategy this time?"

This creates metacognitive awareness — the user learns not just *what* to decide, but *how* they decide, and whether their patterns serve their goals.

---

## 5. The Prototype: De Novo Antibody Design Journey

### 5.1 What It Does

A web-based workbench where a bench scientist goes from **target antigen structure → novel antibody candidates** through an AI-collaborative workflow. No code. No waiting for computational biology support.

### 5.2 Core Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                    THE DAYHOFF WORKFLOW                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. TARGET INPUT                                             │
│     Upload PDB structure or enter antigen ID                 │
│     Claude: "Here's what I see in this structure..."         │
│     [Structural context + relevant literature]               │
│                                                              │
│  2. HOTSPOT ANALYSIS                    ◄── LEARNING MOMENT  │
│     Claude identifies binding hotspots                       │
│     Each hotspot: reasoning + citations + confidence         │
│     Trade-offs explicitly surfaced                           │
│     User selects hotspots (guided, not dictated)             │
│                                                              │
│  3. DESIGN PARAMETERS                                        │
│     Framework selection, CDR loop constraints                │
│     Claude: "Given your hotspot choices, here's why          │
│     I'd suggest Framework X over Y..."                       │
│     [Expandable deep-dive on framework biology]              │
│                                                              │
│  4. GENERATION                          ◄── LEARNING MOMENT  │
│     AI generates candidates across BioMs                     │
│     Progress: not just a spinner, but                        │
│     "Currently optimizing CDR-H3 — here's what              │
│     that loop does and why it matters..."                    │
│                                                              │
│  5. CANDIDATE REVIEW                    ◄── LEARNING MOMENT  │
│     100+ ranked candidates                                   │
│     Each candidate: rationale, predicted properties,         │
│     confidence intervals, literature comparisons             │
│     "Why was this ranked #1?" → full reasoning chain         │
│                                                              │
│  6. CAMPAIGN REFLECTION                 ◄── LEARNING MOMENT  │
│     "Here's what you chose and why. Here's how your          │
│     approach compares to alternatives. Here's what           │
│     you might try differently next time."                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Magic Moments

**Magic Moment 1: The Reasoning Panel**
User clicks on a hotspot recommendation and sees:
- Literature citations with DOI links
- Confidence score: "90% confident based on 12 supporting publications"
- Explicit trade-offs: "K417 may reduce Tm by ~3°C based on [citation]"
- Alternative approaches: "Consider N501Y if stability is prioritized"
- Transparent limitations: "We're confident about binding affinity prediction; less confident about developability"

*Why this is a learning moment:* The scientist doesn't just learn *what* to pick — they learn *how to reason about picking.* Next time, they'll ask these questions themselves.

**Magic Moment 2: "I Am the Specialist Now"**
A bench scientist completes their first design campaign and realizes they can now:
- Discuss hotspot selection trade-offs with computational colleagues as peers
- Present design rationale to PIs with literature backing they understand
- Defend their choices in review meetings with the same rigor as a comp bio specialist

*Why this is a learning moment:* Mental model transformation from "I need to wait for comp bio" to "I can reason about this myself."

**Magic Moment 3: Campaign Intelligence**
After multiple campaigns, the system surfaces:
- "You've been consistently avoiding loop-grafting approaches. Here's when loop-grafting outperforms de novo design: [context]. Want to try it on this target?"
- Patterns in the user's decision-making they weren't consciously aware of

*Why this is a learning moment:* Metacognition — learning about your own learning.

---

## 6. Technical Architecture

### 6.1 Stack

```
Frontend:     React + TypeScript
UI:           Tailwind CSS + shadcn/ui
AI Backend:   Claude API (Sonnet for interactions, Opus for complex reasoning)
Molecular:    Mol* (3D structure visualization, open-source)
State:        React state + persistent storage API
Build:        Claude Code (iterative development)
```

### 6.2 Key Components

| Component | Purpose | Learning Role |
|-----------|---------|---------------|
| **Structure Viewer** | 3D antigen visualization with interactive hotspot overlay | Spatial reasoning development |
| **Reasoning Panel** | Expandable rationale for every AI recommendation | Scientific reasoning scaffolding |
| **Confidence Dashboard** | Visual confidence intervals + uncertainty ranges | Calibration and risk assessment skills |
| **Campaign Timeline** | Visual history of design decisions + outcomes | Pattern recognition and reflection |
| **Knowledge Library** | Contextual literature surfaced at decision points | Domain knowledge building |
| **Scaffold Manager** | Tracks user expertise, adjusts guidance level | Adaptive learning progression |

### 6.3 Claude Integration Points

```
┌─────────────────────────────────────────────┐
│              CLAUDE INTEGRATION              │
├─────────────────────────────────────────────┤
│                                             │
│  SYSTEM PROMPT LAYERS:                      │
│  ├── Base: Scientific reasoning framework   │
│  ├── Domain: Antibody design knowledge      │
│  ├── Pedagogy: Scaffold level + user model  │
│  └── Context: Current campaign state        │
│                                             │
│  API CALLS:                                 │
│  ├── Hotspot analysis (structured output)   │
│  ├── Trade-off reasoning (streaming)        │
│  ├── Candidate generation (batch)           │
│  ├── Literature synthesis (RAG-augmented)   │
│  └── Reflection generation (campaign end)   │
│                                             │
│  LEARNING SIGNALS:                          │
│  ├── User's scaffold level (1-5)            │
│  ├── Decision patterns across campaigns     │
│  ├── Questions asked (curiosity signals)    │
│  └── Reasoning panel engagement depth       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 7. Mapping to Evaluation Criteria

### 7.1 Technical Execution
**"Can you rapidly build something functional and iterate?"**
- Built with Claude Code — rapid prototyping with AI-assisted development
- React + TypeScript for a production-grade foundation
- Mol* for real molecular visualization (not mockups)
- Claude API integration for live AI reasoning (not canned responses)

### 7.2 Growth-First Thinking
**"Does your prototype genuinely enhance learning and skill growth?"**
- **Transparent reasoning** → develops scientific judgment, not just task completion
- **Scaffolded fading** → progressively builds independence
- **Campaign reflection** → creates metacognitive awareness
- **Confidence calibration** → teaches scientists to reason about uncertainty
- Validated through 90+ interviews: scientists want defensibility, not just answers

### 7.3 User Empathy
**"Do you understand the needs of learners and educators?"**
- Grounded in 7 years building clinical genomics tools at Roche (10,000+ clinicians)
- 90+ user research interviews with bench scientists at Stanford, Harvard, GSK, Takeda
- Deep understanding of the bench-to-comp-bio dependency loop
- Designed for scientists who are experts in biology but not computation

### 7.4 Clear Communication
**"Can you articulate your design decisions and rationale?"**
- Every design choice maps to a specific user need identified in research
- Reasoning panels model the communication we want to teach: transparent, cited, uncertainty-aware
- This document itself demonstrates structured thinking about the problem space

### 7.5 Creative Problem-Solving
**"How do you approach ambiguous challenges?"**
- Reframed the Education Labs prompt: "learning" doesn't mean tutorials — it means *doing real work with transparent AI that teaches you to think*
- Applied pedagogical scaffolding theory to a domain (drug discovery) where it's never been applied this way
- Bridge between Anthropic's mission (safe, beneficial AI) and real-world impact (faster drugs for patients)

### 7.6 Scalability Thinking
**"Can your solution generalize?"**

The Dayhoff model — transparent reasoning + scaffolded fading + campaign reflection — generalizes to any domain where:
- Experts need to develop new competencies
- AI can show its reasoning chain
- Decisions have trade-offs worth understanding

Examples: clinical trial design, materials science, genomic analysis, synthetic biology, drug-target interaction modeling, protein engineering.

---

## 8. Build Plan (Claude Code)

### Phase 1: Core Shell (Day 1)
- [ ] React app scaffold with routing
- [ ] Landing/onboarding flow
- [ ] Structure input panel (PDB upload / ID entry)
- [ ] Basic Mol* integration for 3D visualization
- [ ] Claude API integration (system prompt + streaming)

### Phase 2: The Learning Engine (Day 2)
- [ ] Hotspot analysis workflow with reasoning panels
- [ ] Confidence score visualization
- [ ] Trade-off comparison UI
- [ ] Literature citation display with DOI links
- [ ] Scaffold level tracking (start at Level 1)

### Phase 3: Design Pipeline (Day 3)
- [ ] Design parameter configuration (frameworks, loops, constraints)
- [ ] Candidate generation flow (simulated + Claude-reasoned)
- [ ] Candidate ranking with expandable rationale
- [ ] "Why this rank?" deep-dive interaction

### Phase 4: Campaign Intelligence (Day 4)
- [ ] Campaign timeline visualization
- [ ] Reflection generation (end-of-campaign Claude synthesis)
- [ ] Pattern surfacing across campaigns
- [ ] Scaffold progression (auto-advance based on engagement)

### Phase 5: Polish + Demo (Day 5)
- [ ] End-to-end flow testing
- [ ] Visual polish (design system consistency)
- [ ] Demo script / walkthrough mode
- [ ] Documentation and rationale write-up

---

## 9. What Makes This Different

| Typical AI Tool | Dayhoff |
|----------------|---------|
| "Here are your results" | "Here's why these are your results, where I'm confident, and where I'm not" |
| Black-box ranking | Transparent reasoning chains with literature citations |
| Same interface for novice and expert | Adaptive scaffolding that grows with you |
| Optimizes for task completion | Optimizes for understanding + completion |
| User depends on the tool | User graduates from the tool |
| "Smart tool" | "Tool that makes YOU smarter and defensible" |

---

## 10. Why This Matters for Anthropic

Anthropic's mission is the responsible development of AI for humanity's long-term benefit. Dayhoff demonstrates a concrete vision of what that looks like in practice:

- **AI that enhances human agency** — scientists become more capable, not more dependent
- **AI that is transparent about uncertainty** — building appropriate trust through honesty
- **AI that teaches** — every interaction is a learning opportunity, not just a transaction
- **AI applied to urgent problems** — drug development directly impacts human lives

The Dayhoff Project isn't just a prototype. It's a proof point that AI collaboration and human learning aren't in tension — they're the same thing, done right.

---

*"The goal is not to have AI do the science for us. The goal is to have AI make us better scientists."*

— The Dayhoff Principle
