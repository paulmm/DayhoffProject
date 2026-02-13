export interface ModuleExercise {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  workflowId: string;
  sampleInputDescription: string;
  demoPdbId: string;
  whatYoullLearn: string[];
  expectedOutcome: string;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

const MODULE_EXERCISES: ModuleExercise[] = [
  {
    id: "exercise-rfdiffusion-binder",
    moduleId: "rfdiffusion",
    title: "Design a Novel Protein Binder",
    description:
      "Use RFdiffusion to generate a de novo protein backbone that binds to the SARS-CoV-2 RBD. You'll configure diffusion parameters, specify hotspot residues on the target, and see how the model generates novel structures from noise.",
    workflowId: "de-novo-design",
    sampleInputDescription:
      "PDB 6M0J — SARS-CoV-2 spike RBD bound to ACE2. You'll target the RBD interface.",
    demoPdbId: "6M0J",
    whatYoullLearn: [
      "How diffusion models generate protein structures from noise",
      "The role of hotspot residues in guiding binder design",
      "How to evaluate backbone quality with scTM scores",
    ],
    expectedOutcome:
      "A set of novel protein backbone structures designed to bind the SARS-CoV-2 RBD, with sequences designed by ProteinMPNN and validated by ESMFold.",
    estimatedTime: "2-4 hours",
    difficulty: "intermediate",
  },
  {
    id: "exercise-proteinmpnn-sequence",
    moduleId: "proteinmpnn",
    title: "Design Sequences for a Known Structure",
    description:
      "Given the backbone of crambin (a well-characterized small protein), use ProteinMPNN to design new amino acid sequences that should fold into the same structure. Compare the designed sequences to the natural sequence.",
    workflowId: "de-novo-design",
    sampleInputDescription:
      "PDB 1CRN — Crambin, a 46-residue plant protein with a well-resolved crystal structure.",
    demoPdbId: "1CRN",
    whatYoullLearn: [
      "How inverse folding differs from structure prediction",
      "The role of message-passing neural networks in sequence design",
      "How to assess sequence recovery rates and diversity",
    ],
    expectedOutcome:
      "Multiple designed sequences for the crambin backbone, with analysis of how they compare to the natural sequence and predicted folding accuracy.",
    estimatedTime: "1-2 hours",
    difficulty: "beginner",
  },
  {
    id: "exercise-alphafold2-validate",
    moduleId: "alphafold2",
    title: "Predict and Validate a Protein Structure",
    description:
      "Take the sequence of ubiquitin and predict its 3D structure with AlphaFold2. Compare the prediction to the experimentally determined structure (PDB 1UBQ) to understand prediction accuracy and confidence metrics.",
    workflowId: "structure-prediction",
    sampleInputDescription:
      "PDB 1UBQ — Ubiquitin, a 76-residue protein with an extremely well-characterized structure.",
    demoPdbId: "1UBQ",
    whatYoullLearn: [
      "How AlphaFold2 uses multiple sequence alignments for structure prediction",
      "How to interpret pLDDT confidence scores and PAE plots",
      "When to trust (and not trust) predicted structures",
    ],
    expectedOutcome:
      "A predicted 3D structure of ubiquitin with high confidence scores, along with a comparison to the experimental crystal structure.",
    estimatedTime: "1-3 hours",
    difficulty: "beginner",
  },
  {
    id: "exercise-esmfold-screening",
    moduleId: "esmfold",
    title: "Rapid Structure Screening",
    description:
      "Use ESMFold to quickly predict structures for multiple protein sequences — much faster than AlphaFold2. Screen a batch of designed sequences to identify which ones are likely to fold well before investing in full AlphaFold2 runs.",
    workflowId: "structure-prediction",
    sampleInputDescription:
      "PDB 1CRN — Crambin sequence and several designed variants for rapid screening.",
    demoPdbId: "1CRN",
    whatYoullLearn: [
      "How ESMFold achieves fast predictions using protein language models",
      "The speed-accuracy tradeoff between ESMFold and AlphaFold2",
      "How to use pLDDT as a filter for high-throughput screening",
    ],
    expectedOutcome:
      "Rapid structure predictions for multiple sequences, with pLDDT scores used to rank and filter candidates for further analysis.",
    estimatedTime: "30-60 min",
    difficulty: "beginner",
  },
  {
    id: "exercise-evoprotgrad-evolve",
    moduleId: "evoprotgrad",
    title: "Evolve a Protein In Silico",
    description:
      "Apply directed evolution to ubiquitin using EvoProtGrad. Define a fitness objective, watch the algorithm explore sequence space through guided mutations, and see how computational evolution can optimize protein properties.",
    workflowId: "directed-evolution",
    sampleInputDescription:
      "PDB 1UBQ — Ubiquitin, a robust protein ideal for testing directed evolution strategies.",
    demoPdbId: "1UBQ",
    whatYoullLearn: [
      "How gradient-based directed evolution works computationally",
      "The difference between random mutagenesis and guided evolution",
      "How to define and evaluate fitness functions for protein optimization",
    ],
    expectedOutcome:
      "A set of evolved ubiquitin variants with improved predicted fitness scores, along with a trajectory showing how the sequences evolved over iterations.",
    estimatedTime: "1-2 hours",
    difficulty: "intermediate",
  },
  {
    id: "exercise-rfantibody-cdr",
    moduleId: "rfantibody",
    title: "Design Antibody CDR Loops",
    description:
      "Use RFAntibody to design complementarity-determining region (CDR) loops for an antibody targeting a known antigen. Configure which CDR loops to redesign and analyze the generated candidates.",
    workflowId: "antibody-optimization",
    sampleInputDescription:
      "PDB 7DK2 — An antibody-antigen complex used as the starting scaffold for CDR loop redesign.",
    demoPdbId: "7DK2",
    whatYoullLearn: [
      "How CDR loops determine antibody specificity and binding",
      "How diffusion models can generate diverse loop conformations",
      "How to evaluate designed antibodies for developability",
    ],
    expectedOutcome:
      "Multiple antibody variants with redesigned CDR loops, ranked by predicted binding affinity and structural quality.",
    estimatedTime: "2-3 hours",
    difficulty: "advanced",
  },
  {
    id: "exercise-temstapro-stability",
    moduleId: "temstapro",
    title: "Assess Protein Thermostability",
    description:
      "Use TemStaPro to predict the thermostability of an antibody and its variants. Understand which regions contribute to stability and how mutations affect melting temperature.",
    workflowId: "antibody-optimization",
    sampleInputDescription:
      "PDB 7DK2 — An antibody structure for thermostability assessment and comparison.",
    demoPdbId: "7DK2",
    whatYoullLearn: [
      "How protein language models predict thermostability",
      "The relationship between sequence features and melting temperature",
      "How to use stability predictions to filter designed candidates",
    ],
    expectedOutcome:
      "Thermostability predictions for the wild-type antibody and several variants, with insights into which mutations improve or reduce stability.",
    estimatedTime: "30-60 min",
    difficulty: "intermediate",
  },
  {
    id: "exercise-geodock-docking",
    moduleId: "geodock",
    title: "Dock Two Proteins Together",
    description:
      "Use GeoDock to predict how two proteins interact. Dock an antibody onto its antigen target and analyze the predicted binding interface, comparing it to the known crystal structure.",
    workflowId: "molecular-docking",
    sampleInputDescription:
      "PDB 3HFM — A protein-protein complex for docking prediction and interface analysis.",
    demoPdbId: "3HFM",
    whatYoullLearn: [
      "How geometric deep learning approaches protein-protein docking",
      "The difference between rigid-body and flexible docking",
      "How to evaluate docking predictions using interface RMSD and DockQ scores",
    ],
    expectedOutcome:
      "A predicted docking pose for the protein-protein complex, with scoring metrics comparing the prediction to the experimentally determined binding mode.",
    estimatedTime: "1-2 hours",
    difficulty: "intermediate",
  },
];

export function getExercisesForModule(moduleId: string): ModuleExercise[] {
  return MODULE_EXERCISES.filter((e) => e.moduleId === moduleId);
}

export function getExerciseById(id: string): ModuleExercise | undefined {
  return MODULE_EXERCISES.find((e) => e.id === id);
}
