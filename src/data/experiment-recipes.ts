export interface ParameterTooltip {
  what: string;
  effect: string;
  recommended: string;
}

export interface RecipeParameter {
  id: string;
  label: string;
  type: "range" | "number" | "text" | "select" | "file" | "multitext";
  default: string | number;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  tooltip: ParameterTooltip;
  required?: boolean;
  placeholder?: string;
  unit?: string;
}

export interface ExperimentRecipe {
  id: string;
  name: string;
  description: string;
  moduleIds: string[];
  timeEstimate: string;
  requiresGpu: boolean;
  whatWillLearn: string[];
  whatToExpect: string;
  parameters: RecipeParameter[];
  commonParameters: RecipeParameter[];
}

/* ── Common parameters shared across recipes ──────────────────── */

const COMMON_PARAMS: RecipeParameter[] = [
  {
    id: "random_seed",
    label: "Random Seed",
    type: "number",
    default: 42,
    min: 0,
    max: 999999,
    tooltip: {
      what: "A number that initializes the random number generator, ensuring reproducible results.",
      effect: "Using the same seed produces identical outputs across runs. Changing it explores different solutions.",
      recommended: "Keep the default (42) for your first run, then try different seeds to explore diversity.",
    },
  },
  {
    id: "output_format",
    label: "Output Format",
    type: "select",
    default: "pdb",
    options: [
      { value: "pdb", label: "PDB (Structure)" },
      { value: "fasta", label: "FASTA (Sequence)" },
      { value: "both", label: "Both PDB + FASTA" },
    ],
    tooltip: {
      what: "The file format for experiment outputs.",
      effect: "PDB files contain 3D atomic coordinates for visualization. FASTA files contain amino acid sequences for analysis.",
      recommended: "Choose 'Both' to get the full picture — structure for visualization and sequence for downstream analysis.",
    },
  },
];

/* ── 5 Pre-built recipes ──────────────────────────────────────── */

export const EXPERIMENT_RECIPES: ExperimentRecipe[] = [
  {
    id: "de-novo-design",
    name: "De Novo Protein Design",
    description:
      "Design an entirely new protein from scratch — generate a novel backbone structure, design sequences that fold into it, then validate with fast structure prediction.",
    moduleIds: ["rfdiffusion", "proteinmpnn", "esmfold"],
    timeEstimate: "2-4 hours",
    requiresGpu: true,
    whatWillLearn: [
      "How diffusion models generate novel protein backbones from noise",
      "The inverse folding problem: designing sequences for a target structure",
      "Self-consistency validation: does the designed sequence fold back correctly?",
      "The generate → design → validate cycle used in modern protein engineering",
    ],
    whatToExpect:
      "This experiment runs a 3-step pipeline. First, RFdiffusion generates novel protein backbone structures using a denoising diffusion process (similar to image generation AI, but in 3D protein space). Next, ProteinMPNN solves the inverse folding problem — it designs amino acid sequences predicted to fold into your generated backbone. Finally, ESMFold validates each design by predicting whether the sequence actually folds into the intended structure. You'll receive PDB structure files, FASTA sequences, and confidence scores (pLDDT) for each design. High-confidence designs (pLDDT > 80) with low RMSD between designed and predicted structures are your best candidates for experimental validation.",
    parameters: [
      {
        id: "input_pdb",
        label: "Input PDB Structure",
        type: "file",
        default: "",
        tooltip: {
          what: "A PDB file containing the target protein or scaffold to condition the diffusion process.",
          effect: "Providing a structure constrains the generation — the model designs new proteins that interact with or extend from your input. Without it, fully unconditional generation produces random folds.",
          recommended: "Upload a PDB of your target protein if designing a binder. Leave empty for fully unconditional backbone generation.",
        },
        placeholder: "Upload .pdb file or drag & drop",
      },
      {
        id: "chain_selection",
        label: "Chain Selection",
        type: "text",
        default: "A",
        tooltip: {
          what: "Which chain(s) from the PDB file to use as the conditioning structure.",
          effect: "Multi-chain PDB files contain several protein chains. Selecting specific chains focuses the design on those regions.",
          recommended: "Use chain A for single-chain targets. For complexes, specify all relevant chains (e.g., 'A,B').",
        },
        placeholder: "e.g., A or A,B",
      },
      {
        id: "hotspot_residues",
        label: "Hotspot Residues",
        type: "text",
        default: "",
        tooltip: {
          what: "Specific residue positions on the target that the designed protein should contact.",
          effect: "Hotspot residues guide RFdiffusion to generate backbones that make contacts at these positions, dramatically increasing the chance of functional binding.",
          recommended: "Identify 3-5 key residues in the binding site from structural analysis or literature. Format: 'A25,A30,A45'.",
        },
        placeholder: "e.g., A25,A30,A45",
      },
      {
        id: "num_designs",
        label: "Number of Designs",
        type: "range",
        default: 10,
        min: 1,
        max: 500,
        step: 1,
        tooltip: {
          what: "How many independent protein designs to generate in this experiment.",
          effect: "More designs increases your chance of finding a winner, but takes proportionally longer. Each design explores a different region of structure space.",
          recommended: "Start with 10 for quick exploration, scale to 50-100 for production campaigns. 500 for exhaustive searches.",
        },
        unit: "designs",
      },
      {
        id: "temperature",
        label: "Sampling Temperature",
        type: "range",
        default: 0.1,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        tooltip: {
          what: "Controls the randomness/diversity of generated structures and sequences.",
          effect: "Low temperature (0.1) produces conservative, high-confidence designs clustered around known folds. High temperature (0.8+) explores more exotic structures with higher novelty but lower success rate.",
          recommended: "Use 0.1 for safe, reliable designs. Use 0.3-0.5 for moderate diversity. Use 0.8+ only for creative exploration.",
        },
      },
    ],
    commonParameters: COMMON_PARAMS,
  },
  {
    id: "antibody-optimization",
    name: "Antibody Optimization",
    description:
      "Design and optimize antibody variable regions for target binding, then assess thermostability for developability.",
    moduleIds: ["rfantibody", "temstapro"],
    timeEstimate: "1-2 hours",
    requiresGpu: true,
    whatWillLearn: [
      "How computational antibody design works at the CDR loop level",
      "Why thermostability matters for therapeutic antibody development",
      "The balance between binding affinity and developability properties",
      "Structure-guided vs sequence-guided antibody optimization strategies",
    ],
    whatToExpect:
      "This experiment uses RFAntibody to design antibody variable regions (VH/VL) optimized for binding your target protein. The model designs CDR (Complementarity-Determining Region) loops — the hypervariable segments that determine what the antibody binds to — while maintaining the conserved framework that ensures proper immunoglobulin folding. TemStaPro then evaluates each design's thermostability, predicting whether the antibody will remain folded at physiological and elevated temperatures. You'll receive designed antibody structures, sequences, binding confidence scores, and stability classifications. Designs that pass both binding and stability filters are your best candidates for experimental characterization.",
    parameters: [
      {
        id: "target_pdb",
        label: "Target Antigen PDB",
        type: "file",
        default: "",
        tooltip: {
          what: "The 3D structure of the target protein (antigen) you want your antibody to bind.",
          effect: "A high-quality target structure is critical — the model uses the surface geometry and electrostatics to design complementary CDR loops.",
          recommended: "Use an experimental crystal structure if available. AlphaFold predictions work if pLDDT > 80 in the binding region.",
        },
        required: true,
        placeholder: "Upload target .pdb file",
      },
      {
        id: "cdr_design_mode",
        label: "CDR Design Mode",
        type: "select",
        default: "h3_only",
        options: [
          { value: "h3_only", label: "CDR-H3 Only (fastest)" },
          { value: "all_heavy", label: "All Heavy Chain CDRs" },
          { value: "all_cdrs", label: "All CDRs (most thorough)" },
        ],
        tooltip: {
          what: "Which CDR loops to redesign. CDR-H3 is the most variable and contributes most to binding specificity.",
          effect: "Designing more CDRs gives more optimization freedom but increases computational cost and the chance of destabilizing the framework.",
          recommended: "Start with CDR-H3 only for initial exploration, then expand to all CDRs for promising candidates.",
        },
      },
      {
        id: "num_candidates",
        label: "Number of Candidates",
        type: "range",
        default: 20,
        min: 5,
        max: 200,
        step: 5,
        tooltip: {
          what: "How many antibody variant designs to generate.",
          effect: "More candidates increases diversity. Antibody design has a lower hit rate than general protein design, so generating more candidates is important.",
          recommended: "Generate at least 20 candidates. For therapeutic campaigns, 50-100 provides good coverage.",
        },
        unit: "candidates",
      },
      {
        id: "stability_threshold",
        label: "Stability Threshold",
        type: "range",
        default: 65,
        min: 37,
        max: 90,
        step: 1,
        tooltip: {
          what: "Minimum predicted melting temperature (Tm) in Celsius for accepting a design.",
          effect: "Higher thresholds are more stringent — fewer designs pass but survivors are more stable. Therapeutic antibodies typically need Tm > 65C.",
          recommended: "Use 65C for therapeutic candidates, 50C for research-grade antibodies, 37C to keep everything.",
        },
        unit: "°C",
      },
    ],
    commonParameters: COMMON_PARAMS,
  },
  {
    id: "structure-prediction",
    name: "Structure Prediction",
    description:
      "Predict the 3D structure of a protein from its amino acid sequence using state-of-the-art deep learning, with cross-validation between two independent methods.",
    moduleIds: ["alphafold2", "esmfold"],
    timeEstimate: "30-60 minutes",
    requiresGpu: true,
    whatWillLearn: [
      "How AlphaFold2 uses evolutionary information (MSAs) for structure prediction",
      "How ESMFold uses protein language models as an alternative approach",
      "Interpreting confidence metrics: pLDDT and PAE",
      "When to trust (and not trust) predicted structures",
    ],
    whatToExpect:
      "This experiment predicts your protein's 3D structure using two complementary methods. AlphaFold2 searches databases for evolutionary relatives (the MSA), using co-evolution patterns to infer residue contacts and predict structure with near-experimental accuracy. ESMFold takes a fundamentally different approach — using a large protein language model trained on millions of sequences to predict structure from a single sequence without MSA. Comparing both predictions gives you confidence: regions where both methods agree are highly reliable, while disagreements flag flexible loops or potential prediction errors. You'll receive PDB structure files with per-residue confidence scores (pLDDT), predicted aligned error (PAE) matrices, and comparison metrics.",
    parameters: [
      {
        id: "input_sequence",
        label: "Protein Sequence (FASTA)",
        type: "multitext",
        default: "",
        tooltip: {
          what: "The amino acid sequence of the protein you want to predict the structure of.",
          effect: "Longer sequences take more time and memory. Sequences over 1000 residues may require chunking or special handling.",
          recommended: "Paste the full sequence in FASTA format (with or without the >header line). For multi-domain proteins, consider predicting domains separately.",
        },
        required: true,
        placeholder: ">protein_name\nMKFLILFNILV...",
      },
      {
        id: "msa_mode",
        label: "MSA Generation Mode",
        type: "select",
        default: "full",
        options: [
          { value: "full", label: "Full MSA (most accurate)" },
          { value: "reduced", label: "Reduced MSA (faster)" },
          { value: "single_sequence", label: "Single Sequence (fastest)" },
        ],
        tooltip: {
          what: "Controls how AlphaFold2 builds the multiple sequence alignment. More sequences = better co-evolution signal.",
          effect: "Full MSA searches large databases (UniRef, MGnify) for maximum evolutionary information. Reduced uses fewer databases for speed. Single sequence skips MSA entirely (similar to ESMFold).",
          recommended: "Use Full MSA for important predictions. Reduced for quick screening. Single Sequence only for comparison with ESMFold.",
        },
      },
      {
        id: "num_models",
        label: "Number of Models",
        type: "range",
        default: 5,
        min: 1,
        max: 5,
        step: 1,
        tooltip: {
          what: "AlphaFold2 has 5 trained model variants. Running all 5 and taking the best gives the most reliable prediction.",
          effect: "More models = better coverage of conformational space and more reliable ranking. Fewer models = faster but may miss the best prediction.",
          recommended: "Use all 5 models for publication-quality predictions. Use 1-2 for quick screening.",
        },
        unit: "models",
      },
      {
        id: "relax_prediction",
        label: "Energy Minimization",
        type: "select",
        default: "best",
        options: [
          { value: "none", label: "None (raw prediction)" },
          { value: "best", label: "Best Model Only" },
          { value: "all", label: "All Models (slowest)" },
        ],
        tooltip: {
          what: "Whether to run Amber force field relaxation on predicted structures to remove steric clashes.",
          effect: "Relaxation improves physical realism (removes atom clashes) but doesn't significantly change the fold. Takes extra time per model.",
          recommended: "Relax the best model for a balance of quality and speed. Skip relaxation for quick screening.",
        },
      },
    ],
    commonParameters: COMMON_PARAMS,
  },
  {
    id: "directed-evolution",
    name: "Directed Evolution",
    description:
      "Computationally evolve a protein sequence for improved properties using gradient-guided optimization, then assess the stability of evolved variants.",
    moduleIds: ["evoprotgrad", "temstapro"],
    timeEstimate: "1-3 hours",
    requiresGpu: true,
    whatWillLearn: [
      "How computational directed evolution mimics laboratory evolution in silico",
      "Fitness landscapes and navigating sequence space with gradients",
      "The trade-off between exploration (diversity) and exploitation (optimization)",
      "Why stability assessment is critical for evolved protein variants",
    ],
    whatToExpect:
      "This experiment evolves your starting protein sequence toward improved properties. EvoProtGrad uses gradients from protein language models to propose intelligent mutations — like a GPS navigating the fitness landscape rather than randomly wandering. Starting from your parent sequence, it performs iterative rounds of mutation and evaluation, climbing toward fitness peaks. Each round proposes mutations at positions where the language model predicts the biggest improvements. TemStaPro then evaluates whether the evolved variants maintain structural stability. You'll receive a ranked list of evolved sequences with predicted fitness scores, mutation annotations, and stability classifications. The top candidates balance improved function with maintained stability.",
    parameters: [
      {
        id: "parent_sequence",
        label: "Parent Sequence (FASTA)",
        type: "multitext",
        default: "",
        tooltip: {
          what: "The starting protein sequence you want to evolve/optimize.",
          effect: "Evolution starts from this sequence. A functional parent is important — the algorithm optimizes from the starting point, it can't fix a fundamentally broken protein.",
          recommended: "Use a sequence with known function. Wild-type sequences or previously characterized variants work best.",
        },
        required: true,
        placeholder: ">parent_protein\nMKFLILFNILV...",
      },
      {
        id: "num_mutations",
        label: "Max Mutations Per Variant",
        type: "range",
        default: 3,
        min: 1,
        max: 20,
        step: 1,
        tooltip: {
          what: "Maximum number of amino acid substitutions allowed per evolved variant.",
          effect: "Fewer mutations (1-3) explores the local fitness landscape safely. More mutations (5+) enables larger jumps but risks destabilizing the protein through epistatic effects.",
          recommended: "Start with 1-3 mutations for conservative optimization. Increase to 5-10 only for deeply explored proteins with known epistatic maps.",
        },
        unit: "mutations",
      },
      {
        id: "evolution_rounds",
        label: "Evolution Rounds",
        type: "range",
        default: 5,
        min: 1,
        max: 20,
        step: 1,
        tooltip: {
          what: "Number of iterative optimization rounds. Each round proposes mutations and selects the best variants as parents for the next round.",
          effect: "More rounds enables deeper exploration of sequence space but takes proportionally longer. Diminishing returns typically appear after 5-10 rounds.",
          recommended: "Use 3-5 rounds for quick optimization, 10+ for thorough campaigns.",
        },
        unit: "rounds",
      },
      {
        id: "population_size",
        label: "Population Size",
        type: "range",
        default: 50,
        min: 10,
        max: 500,
        step: 10,
        tooltip: {
          what: "Number of variant sequences maintained at each evolution round.",
          effect: "Larger populations explore more sequence space but are slower. Small populations may get trapped in local optima.",
          recommended: "50-100 for standard runs. 200+ for complex fitness landscapes with known ruggedness.",
        },
        unit: "variants",
      },
    ],
    commonParameters: COMMON_PARAMS,
  },
  {
    id: "molecular-docking",
    name: "Molecular Docking",
    description:
      "Predict how two proteins interact and bind using geometric deep learning. Identifies binding poses, interfaces, and interaction scores.",
    moduleIds: ["geodock"],
    timeEstimate: "1-3 hours",
    requiresGpu: false,
    whatWillLearn: [
      "How protein-protein docking works as a 6D search problem",
      "SE(3)-equivariant geometric deep learning for molecular modeling",
      "Interpreting docking scores and distinguishing true poses from decoys",
      "The role of shape complementarity and electrostatics in protein binding",
    ],
    whatToExpect:
      "This experiment predicts how two proteins physically bind to each other. GeoDock uses SE(3)-equivariant geometric deep learning to search the space of possible orientations and positions, scoring each arrangement to find the most likely binding mode. The algorithm considers shape complementarity, electrostatics, and learned structural signatures of true binding interfaces. You'll receive the predicted complex structure (both proteins docked together), a ranked list of alternative poses with confidence scores, per-residue interface contacts, and binding energy estimates. Top-scoring poses with consistent interface contacts across multiple runs are the most reliable predictions.",
    parameters: [
      {
        id: "receptor_pdb",
        label: "Receptor PDB Structure",
        type: "file",
        default: "",
        tooltip: {
          what: "The 3D structure of the larger/receptor protein in PDB format.",
          effect: "The receptor is treated as the stationary partner. The ligand protein is moved and rotated to find the optimal binding pose.",
          recommended: "Use experimental crystal structures when available. For predicted structures, ensure pLDDT > 70 in the expected binding region.",
        },
        required: true,
        placeholder: "Upload receptor .pdb file",
      },
      {
        id: "ligand_pdb",
        label: "Ligand PDB Structure",
        type: "file",
        default: "",
        tooltip: {
          what: "The 3D structure of the smaller/ligand protein that will be docked onto the receptor.",
          effect: "This protein is rotated and translated to find where it binds on the receptor surface.",
          recommended: "Upload the binding partner. For antibody-antigen docking, the antibody is typically the ligand.",
        },
        required: true,
        placeholder: "Upload ligand .pdb file",
      },
      {
        id: "num_poses",
        label: "Number of Poses",
        type: "range",
        default: 10,
        min: 1,
        max: 100,
        step: 1,
        tooltip: {
          what: "How many alternative binding orientations to generate and score.",
          effect: "More poses increases the chance of finding the true binding mode. The top poses are ranked by predicted binding energy.",
          recommended: "Generate 10-20 poses for focused docking, 50+ for blind docking where the binding site is unknown.",
        },
        unit: "poses",
      },
      {
        id: "flexibility_mode",
        label: "Flexibility Mode",
        type: "select",
        default: "rigid",
        options: [
          { value: "rigid", label: "Rigid Body (fastest)" },
          { value: "soft", label: "Soft Docking (allows clashes)" },
          { value: "flexible_sidechains", label: "Flexible Side Chains" },
        ],
        tooltip: {
          what: "Whether to allow proteins to change shape during docking.",
          effect: "Rigid docking is fast but misses induced fit effects. Soft docking tolerates minor clashes. Flexible side chains model local rearrangements at the interface.",
          recommended: "Start with rigid body for speed. Use flexible side chains if rigid docking gives poor scores, suggesting induced fit is important.",
        },
      },
    ],
    commonParameters: COMMON_PARAMS,
  },
];

export function getRecipeById(id: string): ExperimentRecipe | undefined {
  return EXPERIMENT_RECIPES.find((r) => r.id === id);
}
