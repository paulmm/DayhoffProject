# The Dayhoff Project — Claude Code Prompt Chain

## Why This Exists

A reproducible prompt chain that any developer can follow with Claude Code to build **The Dayhoff Project**: an AI-powered bioinformatics learning workbench that teaches users scientific workflows through collaboration with Claude.

Named after [Margaret Dayhoff](https://en.wikipedia.org/wiki/Margaret_Dayhoff), the mother of bioinformatics, The Dayhoff Project transforms what would traditionally be a black-box computational pipeline into an interactive learning experience. Users don't just *run* drug discovery workflows — they *understand* them.

### The Learning Philosophy

Traditional bioinformatics tools optimize for throughput: submit job, get results. Dayhoff optimizes for **understanding**. Every interaction is a learning opportunity:

- **Modules** teach the science behind each computational method
- **Workflow building** teaches experimental design reasoning
- **AI collaboration** uses Socratic dialogue, not just answers
- **Experiment execution** annotates what's happening and why
- **Results** connect back to the concepts, closing the learning loop

The user should leave every session knowing more about bioinformatics than when they started — not just having completed a task.

---

## Prompt Chain (8 Prompts, in order)

Each prompt is designed to be given to Claude Code as a single task. They build on each other sequentially. Estimated total: ~2-3 hours of Claude Code work.

---

## Prompt 1: Project Scaffold, Database & Navigation Shell

Create a Next.js 14 app called "dayhoff" with TypeScript, Tailwind CSS, and App Router.

**Tech stack:**
- next@14.2.5, react@18, typescript@5
- tailwindcss@3 with dark mode, custom purple/pink theme
- prisma with PostgreSQL
- next-auth with JWT strategy (Google OAuth + Credentials dev bypass)
- framer-motion for animations
- lucide-react for icons
- @anthropic-ai/sdk for AI features

**Font:** Titillium Web (local files in public/fonts/, weights 200-900)

**Color palette (dark theme):**
- Background: #0a0b0f / #1a1b23
- Primary: purple-500 (#8b5cf6) to pink-500 (#ec4899) gradient
- Text: white primary, gray-400 secondary
- Borders: white/10
- Learning accents: emerald-400 (#34d399) for learning indicators, amber-400 (#fbbf24) for insights

**Prisma schema (core models):**
- User (id, email, name, role ENUM [USER, ADMIN], organization, onboardingCompleted)
- Account, Session, VerificationToken (standard NextAuth)
- AISettings (userId, anthropicApiKey encrypted, modelId, temperature, maxTokens, topP, topK, enableStreaming, enableCaching)
- Project (id, name, description, targetProtein, indication, modality, visibility, userId)
- Experiment (id, name, description, status ENUM [DRAFT, QUEUED, RUNNING, COMPLETED, FAILED], projectId, parameters JSON, config JSON, goal, userId, startedAt, completedAt)
- ExperimentRun (id, experimentId, status, startedAt, completedAt, logs JSON, metrics JSON, outputFiles JSON)
- LearningProgress (id, userId, moduleId String, conceptsExplored String[], questionsAsked Int default 0, insightsUnlocked String[], skillLevel ENUM [NOVICE, BEGINNER, INTERMEDIATE, ADVANCED] default NOVICE, lastInteraction DateTime)

Set up docker-compose.yml with PostgreSQL 15.
Add `ENCRYPTION_KEY` to `.env.example` for AES-256-CBC API key encryption.
Add a dev bypass login (CredentialsProvider that auto-signs in as demo@dayhoff.bio).
Seed the database with a demo user.

**Navigation sidebar (persistent layout for all authenticated pages):**

Create `src/components/layout/AppLayout.tsx` wrapping all pages inside `(app)/` route group.

- Dayhoff logo at top (text-based: "dayhoff" in lowercase, purple→pink gradient, with a small DNA helix icon)
- Nav items with lucide-react icons:
  - Dashboard (Home)
  - Experiments (Flask)
  - Workflows (GitBranch)
  - Modules (Package)
  - My Learning (GraduationCap) — links to /learning
  - Settings (Settings)
- Collapsed/expanded toggle with smooth animation
- User avatar and name at bottom
- Sign out button
- Active state: left border accent + bg-white/5

Create the root layout with Titillium Web font, dark bg, and SessionProvider.
Create a basic auth signin page and stub pages for each nav destination (just a heading for now).
Add auth middleware that protects all routes except /auth/*.
Add framer-motion page transitions in the layout.

---

## Prompt 2: AI Service & Settings

Create the Anthropic AI integration layer.

**1. src/lib/ai/ai-service.ts — AnthropicAIService class:**
- Constructor takes: apiKey, modelId, temperature, maxTokens, topP, topK
- IMPORTANT: temperature and top_p cannot both be sent to Anthropic API. If both are set, only send temperature.
- Methods: generateCompletion(prompt, systemPrompt), generateCompletionStream(), testConnection()
- Uses @anthropic-ai/sdk messages.create()

**2. src/lib/ai/get-user-ai-service.ts — getUserAIService():**
- Fetches user's AISettings from DB
- Decrypts API key using AES-256-CBC with ENCRYPTION_KEY from env
- Returns AnthropicAIService instance

**3. src/lib/ai/learning-prompts.ts — System prompts for learning modes:**

Define system prompt templates that shape how Claude interacts as a learning partner:

```typescript
export const LEARNING_SYSTEM_PROMPTS = {
  // Used when explaining module concepts
  conceptExplainer: `You are a bioinformatics educator helping a scientist understand 
    computational biology tools. Explain concepts clearly with analogies. After explaining, 
    ask a probing question that tests understanding. Never just give answers — guide the 
    learner to discover insights themselves.`,
  
  // Used when composing workflows  
  workflowMentor: `You are a senior computational biologist mentoring a colleague on 
    experimental design. When suggesting a workflow, explain WHY each step matters and 
    what would happen if it were skipped. Ask the user what they think should come next 
    before revealing your recommendation.`,
  
  // Used when reviewing experiment results
  resultsInterpreter: `You are a research advisor helping interpret computational 
    experiment results. Don't just summarize — connect results back to the underlying 
    biology. Highlight surprising findings and ask the user to hypothesize explanations 
    before providing yours.`,
  
  // Used for general Q&A within the platform
  socraticGuide: `You are a Socratic learning partner for bioinformatics. When asked 
    a question, first assess what the user already knows, then build on that foundation. 
    Use the "what do you think?" approach before providing direct answers. Celebrate 
    correct reasoning.`
}
```

**4. API routes:**
- GET/PUT/DELETE /api/settings/ai — CRUD for AI settings (encrypt API key on save using ENCRYPTION_KEY)
- POST /api/settings/ai/test — Test connection

**5. Settings page at /settings/ai:**
- API key input (sk-ant-... placeholder, show/hide toggle, encrypted storage)
- Model selector cards with these models and pricing:
  - Claude Opus 4.6 (claude-opus-4-6) — $5/$25 per MTok
  - Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) — $3/$15 — default, best performing badge
  - Claude Sonnet 4 (claude-sonnet-4-20250514) — $3/$15
  - Claude Haiku 4.5 (claude-haiku-4-5-20251001) — $1/$5
- Inference parameters: Temperature slider (0-1), Max Tokens, Top P, Top K
- **Learning preference toggle**: "Socratic Mode" (AI asks questions before giving answers) vs "Direct Mode" (AI gives answers with explanations) — default: Socratic
- Test Connection and Save buttons
- Purple theme throughout

---

## Prompt 3: Module Catalog with Learning Content

Create the bioinformatics module system — each module is both a computational tool AND a learning unit.

**1. src/data/modules-catalog.ts — Define ModuleMetadata interface:**
```typescript
{
  id, name, displayName, description, 
  category: 'antibody' | 'protein' | 'interaction' | 'assessment',
  type: 'foundation' | 'specialized' | 'tool',
  moleculeTypes[], functions[],
  inputFormats[], outputFormats[], 
  computeRequirements: { gpu, memory, timeEstimate },
  performance: { accuracy?, speed?, validated },
  tags[], version, author, usageCount, successRate,
  
  // Learning content — this is what makes Dayhoff a learning platform
  learning: {
    conceptSummary: string,        // 2-3 sentence explanation a grad student would understand
    whyItMatters: string,          // Why this method exists, what problem it solves
    keyInsight: string,            // The one thing to remember
    prerequisites: string[],       // Concepts you should understand first
    commonMistakes: string[],      // What beginners get wrong
    deepDiveTopics: string[],      // Topics for further exploration
    relatedPapers: { title: string, year: number, citation: string }[],
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }
}
```

Create these 8 core modules with full learning content:

- **RFdiffusion** (protein engineering, foundation) — de novo structure generation
  - Input: PDB, Output: PDB, GPU required
  - Learning: Explains diffusion models applied to protein structure, why noise→structure works, connection to image generation diffusion models
  
- **ProteinMPNN** (protein engineering, foundation) — sequence design from structure
  - Input: PDB, Output: FASTA
  - Learning: Inverse folding problem, why sequence design is harder than structure prediction, message passing neural networks on protein graphs
  
- **AlphaFold2** (protein engineering, foundation) — structure prediction
  - Input: FASTA, Output: PDB, GPU required
  - Learning: The protein folding problem, MSA and evolutionary information, attention mechanisms for spatial reasoning, pLDDT confidence scores
  
- **ESMFold** (protein engineering, foundation) — fast structure prediction
  - Input: FASTA, Output: PDB, GPU required
  - Learning: Language models for proteins, how ESM differs from AlphaFold (no MSA needed), speed vs accuracy tradeoffs
  
- **EvoProtGrad** (protein engineering, specialized) — directed evolution optimization
  - Input: FASTA, Output: FASTA
  - Learning: Directed evolution in silico vs in lab, fitness landscapes, gradient-guided sequence optimization
  
- **RFAntibody** (antibody, specialized) — integrated antibody design pipeline
  - Input: PDB, Output: PDB+FASTA
  - Learning: Antibody structure (VH/VL, CDRs, framework), how computational design accelerates traditional antibody discovery
  
- **TemStaPro** (assessment, tool) — thermostability prediction
  - Input: FASTA, Output: CSV
  - Learning: Why thermostability matters for drug development, melting temperature, protein stability as a drug property
  
- **GeoDock** (interaction, specialized) — protein-protein docking
  - Input: PDB, Output: PDB+CSV
  - Learning: Protein-protein interactions, binding interfaces, docking scoring functions, rigid vs flexible docking

**2. src/app/modules/page.tsx — Module catalog page:**
- Grid of module cards with search, category filter, and type filter
- Each card shows: type badge, name, description, molecule types, I/O formats, compute badges (GPU/time)
- **Learning difficulty badge** on each card (beginner/intermediate/advanced) in emerald/amber/red
- Click navigates to /modules/[id]

**3. src/app/modules/[id]/page.tsx — Module detail page (LEARNING-FOCUSED):**

This is a key learning surface. Two-column layout:

Left column (60%):
- Module header with name, category, type badge
- **"Learn" section** (prominent, top of page):
  - Concept summary with expandable "Why It Matters" 
  - Key insight in a highlighted callout box (emerald accent)
  - Prerequisites as linked tags (click to see that module)
  - Common mistakes in a warning callout
  - Deep dive topics as expandable sections
  - Related papers list
- Technical specs: I/O formats, compute requirements, performance metrics

Right column (40%):
- **"Ask Claude" floating panel**:
  - Conversational interface scoped to this module
  - Pre-loaded suggested questions: "How does [module] compare to [alternative]?", "When would I NOT use this?", "Explain [key concept] like I'm a chemistry grad student"
  - Uses conceptExplainer system prompt from learning-prompts.ts
  - POST /api/modules/[id]/ask — takes question, returns AI response with module context
  - Tracks questions asked → updates LearningProgress

**4. GET /api/modules — Returns all modules from catalog**

**5. src/lib/modules/module-metadata.ts — Helper functions:**
- getCompatibleModules(moduleId, 'upstream'|'downstream') — checks I/O format compatibility
- validateModuleConnection(fromId, toId) — returns {valid, message, **learningNote**} (learningNote explains WHY the connection works or doesn't in scientific terms)
- suggestModulesForGoal(goal) — keyword-based workflow suggestion

**6. src/hooks/useCustomWorkflows.ts — Shared localStorage hook:**
- `useCustomWorkflows()` — returns `{ workflows, saveWorkflow, deleteWorkflow, getWorkflow }`
- Reads/writes to localStorage key 'dayhoff-customWorkflows'
- Used by both workflow builder (save) and experiment creation (list)

---

## Prompt 4: Workflow Builder (Core Canvas)

Create the visual workflow builder at /workflows/builder.

**1. src/components/workflow/WorkflowCanvas.tsx:**
- Visual DAG canvas where modules are draggable nodes
- Each node shows: module name, category color, input/output ports
- Users can draw connections between output→input ports
- Connection validation using validateModuleConnection — **on invalid connection, show the learningNote explaining why these modules can't connect** (e.g., "AlphaFold2 outputs PDB structures, but EvoProtGrad expects FASTA sequences. You'd need a structure-to-sequence step in between.")
- Zoom, pan, and grid background
- Selected module highlighting

**Learning feature — Connection Annotations:**
When a valid connection is made, briefly show a green annotation explaining the data flow:
"RFdiffusion generates 3D backbone structures (PDB) → ProteinMPNN takes these structures and designs amino acid sequences that will fold into them (FASTA)"

Interfaces:
```typescript
WorkflowModule: {
  id, moduleId, name, category, 
  position: {x, y}, 
  inputs[], outputs[], parameters?
}
WorkflowConnection: {
  id, from, to, fromPort, toPort, 
  dataType, validated?,
  learningAnnotation?: string  // Explains what data flows and why
}
```

**2. src/components/workflow/ModulePalette.tsx:**
- Left sidebar listing all available modules grouped by category
- Search/filter
- Each module shows its learning difficulty badge
- Click to add module to canvas (or drag)
- **Hover tooltip**: shows module's conceptSummary from learning content

**3. src/app/workflows/builder/page.tsx:**
- Header with workflow name/description inputs, Save & Validate buttons
- Left panel: ModulePalette (manual mode) — this is the default for Prompt 4, AI mode added in Prompt 5
- Center: WorkflowCanvas
- State: workflow {name, description, modules[], connections[], category, tags[], requirements}
- Save workflow using `useCustomWorkflows()` hook
- After save, redirect to /workflows with success message

**4. src/app/workflows/page.tsx:**
- Lists pre-built workflow templates + user's saved custom workflows (via `useCustomWorkflows()`)
- Two tabs: "Templates" and "My Workflows"
- Pre-built template: "De Novo Protein Design" — RFdiffusion → ProteinMPNN → AlphaFold2
  (Design structure from scratch, generate sequences, validate with structure prediction)
- Each template card includes a **"Learn about this workflow"** link that expands to show why these modules are chained in this order

---

## Prompt 5: AI Workflow Composer (Learning-Focused)

Add AI-powered workflow composition to the workflow builder. This is where Dayhoff's learning model shines — the AI doesn't just build a workflow, it **teaches you experimental design**.

**1. src/components/workflow/AIWorkflowComposer.tsx:**
Left panel component (replaces ModulePalette when in AI mode):

- Textarea for research goal description
- Quick template buttons: "Antibody design", "Structure prediction", "Protein optimization"
- Constraints: max time, GPU available toggle
- **"Generate Workflow" button**

**After generation, show the AI's teaching breakdown:**

```
┌─────────────────────────────────────────────┐
│  🧠 AI Workflow Design                      │
│                                              │
│  Goal: Design antibody targeting PD-L1       │
│                                              │
│  Here's my reasoning:                        │
│                                              │
│  Step 1: RFAntibody                          │
│  WHY: We start with computational antibody   │
│  design because PD-L1's binding interface    │
│  is well-characterized, making it suitable   │
│  for structure-based design...               │
│                                              │
│  Step 2: TemStaPro                           │
│  WHY: Designed antibodies often have         │
│  stability issues. Checking thermostability  │
│  early saves wet lab resources...            │
│                                              │
│  💡 Key insight: This pipeline prioritizes   │
│  developability over raw binding affinity.   │
│  In practice, a stable binder beats a        │
│  high-affinity aggregator.                   │
│                                              │
│  ❓ Before I finalize — what do you think    │
│  should come after stability assessment?     │
│  [Text input for user's answer]              │
│                                              │
│  Confidence: 87%                             │
│  ⚠️ Consider adding docking validation       │
│                                              │
│  [Accept Workflow] [Modify & Discuss]        │
└─────────────────────────────────────────────┘
```

The "Modify & Discuss" button opens a chat-like interface where the user can ask follow-up questions about the design decisions.

**2. Add mode toggle to /workflows/builder left sidebar:**
- "AI Mode" (default) and "Manual" toggle at top of left panel
- AI mode shows AIWorkflowComposer
- Manual mode shows ModulePalette

**3. POST /api/workflows/compose:**
- Takes {goal, constraints, learningMode: boolean}
- Uses getUserAIService() to call Anthropic
- System prompt: workflowMentor from learning-prompts.ts + module catalog metadata
- Instructs AI to:
  - Select modules and define connections
  - Explain reasoning for each step (WHY, not just WHAT)
  - Identify the key insight of the overall design
  - If learningMode=true: pose a Socratic question before finalizing
  - List warnings and alternative approaches
- Returns: {workflow: {name, description, modules[], connections[]}, reasoning, confidenceScore, warnings[], keyInsight, socraticQuestion?}
- Fallback: if no AI configured, use keyword-based suggestModulesForGoal()

**4.** The AI-generated workflow should be editable — user can add/remove/reconnect modules manually after AI generates the initial layout. Connection annotations persist from the AI-generated version.

---

## Prompt 6: Experiment Creation

Create the experiment creation flow at /experiments/new.

This is a 3-step wizard:

**Step 1 — Choose experiment mode and select workflow:**
- 3 mode cards: "Single Experiment", "AI Suggested", "Multi-Experiment Optimization"
- For Single/Multi: show workflow selection with two tabs — "Workflows" (pre-built templates) and "My Workflows" (via `useCustomWorkflows()` hook)
- For AI Suggested: show textarea for research goal, auto-analyze with /api/experiments/analyze-prompt, display AI recommendation with confidence score and reasoning, "Accept & Configure" button
- Pre-built recipes array with 5 entries:
  - De novo design (RFdiffusion, ProteinMPNN, ESMFold) — 2-4 hours, GPU
  - Antibody optimization (RFAntibody, TemStaPro) — 1-2 hours, GPU
  - Structure prediction (AlphaFold2, ESMFold) — 30-60 min, GPU
  - Directed evolution (EvoProtGrad, TemStaPro) — 1-3 hours, GPU
  - Molecular docking (GeoDock) — 1-3 hours
- Each recipe card has a **"What will I learn?"** expandable that lists key concepts covered
- Clicking a recipe auto-advances to Step 2

**Step 2 — Configure parameters:**
- Dynamic form based on selected recipe
- For de novo design: target structure PDB upload, chain selection, hotspot residues, number of designs (1-500), temperature, CDR regions
- For all recipes: common parameter fields (number of designs, output format)
- File upload for PDB/FASTA inputs with drag-and-drop
- Right sidebar: 3D molecular viewer placeholder component

**Learning feature — Parameter Tooltips:**
Each parameter input has an info icon that expands to show:
- What this parameter controls (plain language)
- How changing it affects results
- Recommended range and why
Example: Temperature slider shows "Controls randomness in structure generation. Lower (0.1) = conservative designs similar to your input. Higher (1.0) = more creative/diverse designs. For first-time users, 0.3-0.5 balances novelty with reliability."

**Step 3 — Review and launch:**
- Summary card: experiment name, description, selected workflow, key parameters
- Workflow pipeline visualization (module1 → module2 → module3)
- Estimated time and compute requirements
- **"What to expect" section**: brief explanation of what the experiment will do and what kinds of results to look for
- "Launch Experiment" button → saves to sessionStorage and navigates to /experiments/[id]/running

**API:** POST /api/experiments/analyze-prompt — AI analysis of natural language goal, returns suggested recipe, reasoning, and learning objectives
**API:** POST /api/experiments — Create experiment record in database

---

## Prompt 7: Experiment Execution & Tracking

Create the experiment execution and tracking system.

**1. /experiments/[id]/running/page.tsx — Live execution view:**
- Load experiment from sessionStorage
- Show workflow pipeline with current step highlighted
- Progress bar (0-100%) — **dynamically divide percentage ranges by number of modules** (e.g., 3 modules = ~30% each, 5 modules = ~18% each, with 10% reserved for init and 10% for finalization)
- Simulated step progression:
  - "Initializing environment..." (0-10%)
  - "Running [Module N name]..." (10-90%, divided evenly across modules)
  - "Finalizing results..." (90-100%)
- Elapsed time counter
- Log output panel (terminal-styled, auto-scrolling)

**Learning feature — Live Annotations:**
As each module "runs," show an educational annotation panel alongside the logs:

```
┌─────────────────────────────────────────────┐
│  📚 What's happening now                    │
│                                              │
│  RFdiffusion is generating protein           │
│  backbones using a denoising diffusion       │
│  process. It starts with random noise and    │
│  iteratively refines it into a valid 3D      │
│  protein structure.                          │
│                                              │
│  Think of it like a sculptor starting with   │
│  a rough block of marble and gradually       │
│  revealing the figure inside.                │
│                                              │
│  🔑 Key concept: Diffusion models work by    │
│  learning to reverse a noise process, not    │
│  by building structures from scratch.        │
│                                              │
│  [Ask a question about this step...]         │
│  [Hide annotations]                          │
└─────────────────────────────────────────────┘
```

- Annotations pulled from module learning content
- "Ask a question" links to AI chat scoped to current module + experiment context
- Cancel button
- On completion: success card with "View Results" button → /experiments/[id]

**2. /experiments/[id]/page.tsx — Experiment detail/results page:**
- Header: experiment name, status badge, timestamps
- If running: show progress with poll every 3 seconds
- If completed: show results tabs:
  - **Overview**: key metrics cards (designs generated, success rate, best score)
  - **Outputs**: list of output files with download buttons
  - **Logs**: full execution log
  - **Parameters**: what was configured
  - **🧠 Learn**: AI-generated insights connecting results to concepts
    - "Your top design scored X. This pLDDT score means..." 
    - "The success rate of Y% is typical/above average because..."
    - "To improve results, consider..."
    - Uses resultsInterpreter system prompt
- Re-run button, Export results button

**3. /experiments page — Experiment list:**
- Table/grid of all experiments with: name, workflow, status badge, created date, duration
- Filter by status, sort by date
- Click navigates to detail page

**4. API routes:**
- GET/POST /api/experiments — List and create
- GET/PATCH /api/experiments/[id] — Detail and update
- POST /api/experiments/[id]/cancel — Cancel running experiment
- GET /api/executions — List executions with filtering

---

## Prompt 8: Dashboard & Learning Progress

Create the main dashboard and learning progress tracking.

**1. Dashboard at /dashboard:**
- Welcome header with user name
- Quick action cards: "New Experiment", "Workflow Builder", "Browse Modules"
- Recent experiments list (last 5, with status badges)
- Stats cards: total experiments, running now, completed this week

**Learning quick-start:**
- "Describe your research goal" textarea → navigates to /experiments/new with AI suggested mode
- **"Recommended next step"** card based on learning progress (e.g., "You've used AlphaFold2 but haven't explored ESMFold yet. Try comparing their predictions on the same sequence.")

**2. /learning/page.tsx — Learning Progress Dashboard:**

This is the dedicated learning surface that makes Dayhoff a learning platform, not just a pipeline runner.

**Skill Map** (top section):
- Visual grid of all 8 modules arranged by category
- Each module shows: skill level (Novice→Advanced), concepts explored count, questions asked
- Color coding: gray (not started), emerald shades (progressing), gold (advanced)
- Click any module → navigates to /modules/[id]

**Learning Timeline** (middle section):
- Chronological feed of learning milestones:
  - "Explored RFdiffusion for the first time"
  - "Asked 5 questions about protein folding"
  - "Successfully designed a workflow combining 3 modules"
  - "Completed first experiment with structure prediction"
- Each milestone is a row with timestamp, icon, description

**Insights Collected** (bottom section):
- Expandable list of "key insights" the user has encountered across all modules
- Each insight links back to the module/experiment where it was learned
- Search/filter by topic

**Data source:** LearningProgress model from Prisma + API routes:
- GET /api/learning/progress — User's learning progress across all modules
- PATCH /api/learning/progress/[moduleId] — Update progress when user interacts with a module
- GET /api/learning/insights — Aggregated insights from all module interactions

**3. Update dashboard and all pages to use consistent AppLayout with sidebar from Prompt 1.**

**4. Ensure auth middleware protects all routes except /auth/*.**

---

## Key Architecture Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 14 App Router | Server components, API routes, file-based routing |
| Database | PostgreSQL + Prisma | Type-safe ORM, easy migrations, rich schema |
| Auth | NextAuth JWT + dev bypass | Simple, extensible, works without email service locally |
| AI | @anthropic-ai/sdk direct | Simpler than Bedrock, user brings own API key |
| Workflow canvas | Custom React + SVG | Full control over node/edge rendering, no heavy deps |
| State | useState + localStorage + shared hooks | Simple, consistent cross-page access via useCustomWorkflows |
| Styling | Tailwind + framer-motion | Rapid dark-mode UI, smooth animations |
| Module catalog | Static TypeScript array | Fast, type-safe, no DB needed for module definitions |
| Learning content | Co-located with module metadata | Learning is inseparable from the tool, not an afterthought |
| Workflow persistence | localStorage (MVP) → DB later | Ship fast, migrate to Prisma model when ready |

## What's Intentionally Left Out (for later)

- Real job execution (containers, GPU scheduling)
- File storage (S3)
- Email notifications
- Team/org collaboration
- Wet lab integration
- Custom model training
- Billing/usage tracking
- Real-time WebSocket updates
- Spaced repetition / quiz system
- Collaborative learning (peer discussions)

---

## Learning Model Summary

Every surface in Dayhoff embeds learning:

| Surface | Learning Mechanism | Growth Outcome |
|---------|-------------------|----------------|
| Module catalog | Concept explanations, prerequisites, mistakes | Domain knowledge of bioinformatics methods |
| Module detail "Ask Claude" | Scoped Socratic Q&A | Deep understanding through inquiry |
| Workflow connections | Annotation explaining data flow | Experimental design reasoning |
| AI workflow composer | Step-by-step reasoning, Socratic questions | Scientific workflow thinking |
| Parameter configuration | Contextual tooltips with recommendations | Practical parameter intuition |
| Live execution | Real-time annotations of what's happening | Understanding computational processes |
| Results "Learn" tab | AI insights connecting results to concepts | Result interpretation skills |
| Learning dashboard | Skill map, timeline, collected insights | Self-awareness of growth, motivation |

The key design principle: **Claude never just does — it teaches while doing.** Users can toggle between Socratic mode (questions first) and Direct mode (answers with explanations), but learning content is always present. The goal is that after 10 experiments, a user understands bioinformatics well enough to design workflows without AI assistance.

---

## Verification

After all 8 prompts, test the full flow:
1. Sign in via dev bypass → Dashboard with learning quick-start
2. Browse /modules → see 8 modules with learning badges → click one → see learning content + "Ask Claude" panel
3. Go to /workflows/builder → AI mode → type "design antibody targeting PD-L1" → see Socratic reasoning → generate workflow → see annotated connections on canvas → save
4. Go to /experiments/new → select "De novo design" recipe → see "What will I learn?" → configure parameters with educational tooltips → launch
5. Watch /experiments/[id]/running → see live annotations explaining each step → complete
6. View results on /experiments/[id] → check "Learn" tab for AI insights
7. Visit /learning → see skill map updated, timeline shows milestones, insights collected
