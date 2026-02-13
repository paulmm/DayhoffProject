/* ── Hardcoded AI messages for each workspace step ────────────── */

export const WORKSPACE_MESSAGES = {
  /* Step 1: PDB */
  pdbGreeting:
    "Welcome to the Guided Antibody Design workspace. I'll walk you through designing a de novo antibody against your target antigen, step by step. Let's start by loading your target protein structure. How would you like to provide it?",

  pdbLoaded: (name: string, pdbId: string, chainCount: number, residueCount: number) =>
    `I've loaded **${name} (${pdbId})** — ${chainCount} chain${chainCount !== 1 ? "s" : ""}, ~${residueCount} residues. This is a well-characterized target with extensive structural data available. Let's move on to selecting your antibody framework.`,

  /* Step 2: Framework */
  frameworkIntro:
    "Now let's choose an antibody framework. The framework determines the scaffold architecture for your designed antibody. Each option has different properties for stability, effector function, and manufacturability.",

  frameworkSelected: (fw: string) => {
    const reasons: Record<string, string> = {
      igg1: "**IgG1** is an excellent choice — it's the most commonly used framework for therapeutic antibodies, with well-characterized effector functions (ADCC, CDC) and a long serum half-life (~21 days). The Fc region enables immune cell recruitment, making it ideal for neutralizing antibodies against viral targets like SARS-CoV-2.",
      igg4: "**IgG4** is a great pick for cases where you want target binding without strong effector functions. It has reduced ADCC/CDC activity, which is useful when you want to block a receptor without triggering immune-mediated cell killing. Common in checkpoint inhibitor antibodies.",
      vhh: "**VHH (Nanobody)** — interesting choice! Single-domain antibodies are much smaller (~15 kDa vs ~150 kDa), enabling access to cryptic epitopes that conventional antibodies can't reach. They're also highly stable and easy to produce in microbial systems.",
    };
    return reasons[fw] || `Selected **${fw}** framework.`;
  },

  frameworkTransition:
    "Great choice. Now let's identify the binding hotspots on your target — the regions where your antibody will make contact.",

  /* Step 3: Hotspots */
  hotspotsIntro:
    "I've analyzed the structure and identified three key regions on the SARS-CoV-2 RBD–ACE2 complex. Each region represents a potential epitope for antibody targeting. Select one or more regions, or define a custom residue range.",

  hotspotsSelected: (count: number, names: string[]) =>
    `You've selected **${count} hotspot region${count !== 1 ? "s" : ""}**: ${names.join(", ")}. These regions will guide the antibody backbone generation to ensure complementarity with your chosen epitopes. Let's configure the generation parameters.`,

  /* Step 4: Config */
  configIntro:
    "Almost there. Let's configure the design parameters — how many candidate antibodies to generate, and what CDR loop characteristics to target.",

  configTransition:
    "Configuration locked in. Let me assemble your computational pipeline and show you the experiment summary before launch.",

  /* Step 5: Pipeline */
  pipelineIntro:
    "Here's your antibody design pipeline. I've assembled the optimal sequence of computational modules based on your selections. Review the summary below and launch when ready.",

  pipelineLaunched:
    "Pipeline launched! Your experiment is now running. You'll be redirected to the monitoring dashboard where you can track progress in real time.",
} as const;
