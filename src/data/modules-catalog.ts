export interface ModuleMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: "antibody" | "protein" | "interaction" | "assessment";
  type: "foundation" | "specialized" | "tool";
  moleculeTypes: string[];
  functions: string[];
  inputFormats: string[];
  outputFormats: string[];
  computeRequirements: {
    gpu: boolean;
    memory: string;
    timeEstimate: string;
  };
  performance: {
    accuracy?: string;
    speed?: string;
    validated: boolean;
  };
  tags: string[];
  version: string;
  author: string;
  usageCount: number;
  successRate: number;
  learning: {
    conceptSummary: string;
    whyItMatters: string;
    keyInsight: string;
    prerequisites: string[];
    commonMistakes: string[];
    deepDiveTopics: string[];
    relatedPapers: { title: string; year: number; citation: string }[];
    difficulty: "beginner" | "intermediate" | "advanced";
  };
}

export const MODULE_CATALOG: ModuleMetadata[] = [
  {
    id: "rfdiffusion",
    name: "RFdiffusion",
    displayName: "RFdiffusion",
    description:
      "De novo protein structure generation using denoising diffusion probabilistic models. Generates novel protein backbones from noise or conditional inputs.",
    category: "protein",
    type: "foundation",
    moleculeTypes: ["protein"],
    functions: ["structure generation", "de novo design", "scaffold design"],
    inputFormats: ["PDB"],
    outputFormats: ["PDB"],
    computeRequirements: {
      gpu: true,
      memory: "16 GB",
      timeEstimate: "30-120 min",
    },
    performance: {
      accuracy: "High designability (>70% scTM)",
      speed: "~1 min per design on A100",
      validated: true,
    },
    tags: ["diffusion", "generative", "backbone", "de novo"],
    version: "1.1.0",
    author: "Baker Lab",
    usageCount: 12400,
    successRate: 0.85,
    learning: {
      conceptSummary:
        "RFdiffusion applies denoising diffusion models — the same class of generative AI behind image generators like DALL-E — to protein structure. It starts with random 3D coordinates (noise) and iteratively refines them into physically valid protein backbones through a learned denoising process.",
      whyItMatters:
        "Before RFdiffusion, designing entirely new protein structures required extensive human expertise or slow physics-based simulations. RFdiffusion lets researchers generate novel protein architectures in minutes, opening the door to proteins that nature never evolved — custom binders, enzymes, and molecular machines.",
      keyInsight:
        "Diffusion models don't build structures atom by atom — they learn to reverse a noise process. The model is trained by gradually adding noise to known protein structures, then learning to undo that noise. At generation time, it starts from pure noise and iteratively denoises into a valid structure.",
      prerequisites: [
        "Protein backbone geometry (phi/psi angles, peptide bonds)",
        "Basic understanding of neural networks",
        "PDB file format",
      ],
      commonMistakes: [
        "Generating structures without specifying constraints — unconstrained generation produces valid but random folds with no guaranteed function",
        "Using too few diffusion steps — faster but produces lower quality structures with more clashes",
        "Forgetting that RFdiffusion only generates backbones — you still need ProteinMPNN to design sequences",
      ],
      deepDiveTopics: [
        "Denoising diffusion probabilistic models (DDPMs) and score matching",
        "SE(3) equivariance in protein structure generation",
        "Conditional generation with hotspot residues and contigs",
        "Comparison with hallucination-based design methods",
      ],
      relatedPapers: [
        {
          title:
            "De novo design of protein structure and function with RFdiffusion",
          year: 2023,
          citation: "Watson et al., Nature (2023)",
        },
        {
          title:
            "Broadly applicable and accurate protein design by integrating structure prediction networks and diffusion generative models",
          year: 2024,
          citation: "Krishna et al., bioRxiv (2024)",
        },
      ],
      difficulty: "intermediate",
    },
  },
  {
    id: "proteinmpnn",
    name: "ProteinMPNN",
    displayName: "ProteinMPNN",
    description:
      "Sequence design from protein backbone structures using message passing neural networks. Solves the inverse folding problem — finding amino acid sequences that fold into a desired 3D structure.",
    category: "protein",
    type: "foundation",
    moleculeTypes: ["protein"],
    functions: ["sequence design", "inverse folding"],
    inputFormats: ["PDB"],
    outputFormats: ["FASTA"],
    computeRequirements: {
      gpu: false,
      memory: "8 GB",
      timeEstimate: "1-10 min",
    },
    performance: {
      accuracy: "~50% sequence recovery on native structures",
      speed: "Seconds per design on CPU",
      validated: true,
    },
    tags: ["sequence design", "inverse folding", "MPNN", "graph neural network"],
    version: "1.0.0",
    author: "Baker Lab",
    usageCount: 18700,
    successRate: 0.92,
    learning: {
      conceptSummary:
        "ProteinMPNN tackles the inverse folding problem: given a desired 3D protein backbone, what amino acid sequence will fold into that shape? It uses a message passing neural network that operates on the graph of residue-residue interactions, passing information between neighboring residues to predict optimal amino acids at each position.",
      whyItMatters:
        "Structure prediction (like AlphaFold) goes from sequence → structure. But for protein design, we need the reverse: structure → sequence. ProteinMPNN bridges this gap, enabling the design of sequences for computationally generated structures that have no natural counterpart.",
      keyInsight:
        "Sequence design is fundamentally harder than structure prediction because many different sequences can fold into similar structures (the many-to-one mapping). ProteinMPNN navigates this degeneracy by learning the statistical patterns of sequence-structure relationships from the entire PDB.",
      prerequisites: [
        "Amino acid properties and the genetic code",
        "Protein folding basics",
        "Understanding of PDB coordinate files",
      ],
      commonMistakes: [
        "Designing sequences for backbone structures with steric clashes — ProteinMPNN assumes a valid backbone",
        "Using default temperature for all designs — lower temperature (0.1) gives safer designs, higher (0.5+) gives more diversity",
        "Not sampling multiple sequences — always generate 10-100 candidates and filter",
      ],
      deepDiveTopics: [
        "Message passing neural networks and graph representations of proteins",
        "The inverse folding problem and its relationship to the Boltzmann distribution",
        "Tied vs untied design and multi-chain complexes",
        "Comparison with Rosetta fixed-backbone design",
      ],
      relatedPapers: [
        {
          title:
            "Robust deep learning-based protein sequence design using ProteinMPNN",
          year: 2022,
          citation: "Dauparas et al., Science (2022)",
        },
      ],
      difficulty: "beginner",
    },
  },
  {
    id: "alphafold2",
    name: "AlphaFold2",
    displayName: "AlphaFold2",
    description:
      "State-of-the-art protein structure prediction from amino acid sequences. Uses multiple sequence alignments and attention-based architecture to predict 3D atomic coordinates with near-experimental accuracy.",
    category: "protein",
    type: "foundation",
    moleculeTypes: ["protein"],
    functions: ["structure prediction", "confidence scoring"],
    inputFormats: ["FASTA"],
    outputFormats: ["PDB"],
    computeRequirements: {
      gpu: true,
      memory: "16 GB",
      timeEstimate: "15-60 min",
    },
    performance: {
      accuracy: "GDT > 90 on CASP14 targets",
      speed: "Minutes to hours depending on sequence length",
      validated: true,
    },
    tags: [
      "structure prediction",
      "MSA",
      "attention",
      "pLDDT",
      "deep learning",
    ],
    version: "2.3.0",
    author: "DeepMind",
    usageCount: 45200,
    successRate: 0.95,
    learning: {
      conceptSummary:
        "AlphaFold2 predicts protein 3D structure from amino acid sequence by combining evolutionary information from multiple sequence alignments (MSAs) with a novel attention-based neural network (Evoformer). It outputs atomic coordinates along with per-residue confidence scores (pLDDT) that tell you how reliable each part of the prediction is.",
      whyItMatters:
        "The protein folding problem — predicting 3D structure from sequence — was one of biology's grand challenges for 50 years. AlphaFold2 solved it with near-experimental accuracy in 2020, revolutionizing structural biology. It means researchers can now get structural insights for proteins that have never been crystallized.",
      keyInsight:
        "AlphaFold2's secret weapon is evolutionary information. By comparing your protein's sequence to thousands of related sequences (the MSA), it infers which residues co-evolve — and co-evolving residues are usually in physical contact. This evolutionary signal is what makes accurate folding possible.",
      prerequisites: [
        "Protein primary structure and the central dogma",
        "What a multiple sequence alignment is",
        "Basic concept of neural network attention",
      ],
      commonMistakes: [
        "Trusting low-confidence regions (pLDDT < 50) — these are often disordered loops, not prediction errors",
        "Using AlphaFold for protein-ligand binding predictions — it predicts structure, not binding",
        "Ignoring the MSA quality — poor MSAs (few homologs) lead to poor predictions",
        "Assuming the prediction captures dynamics — AlphaFold predicts a single static structure",
      ],
      deepDiveTopics: [
        "The Evoformer architecture and triangular attention",
        "pLDDT and PAE (Predicted Aligned Error) confidence metrics",
        "MSA construction and database searching with HHblits/JackHMMER",
        "AlphaFold-Multimer for protein complex prediction",
        "Limitations: intrinsically disordered proteins, conformational ensembles",
      ],
      relatedPapers: [
        {
          title:
            "Highly accurate protein structure prediction with AlphaFold",
          year: 2021,
          citation: "Jumper et al., Nature (2021)",
        },
        {
          title:
            "AlphaFold Protein Structure Database: massively expanding coverage",
          year: 2022,
          citation: "Varadi et al., Nucleic Acids Research (2022)",
        },
      ],
      difficulty: "beginner",
    },
  },
  {
    id: "esmfold",
    name: "ESMFold",
    displayName: "ESMFold",
    description:
      "Fast protein structure prediction using protein language models. Predicts 3D structure directly from a single sequence without requiring multiple sequence alignments, trading some accuracy for dramatically faster inference.",
    category: "protein",
    type: "foundation",
    moleculeTypes: ["protein"],
    functions: ["structure prediction", "fast inference"],
    inputFormats: ["FASTA"],
    outputFormats: ["PDB"],
    computeRequirements: {
      gpu: true,
      memory: "12 GB",
      timeEstimate: "1-5 min",
    },
    performance: {
      accuracy: "Slightly below AlphaFold2 on average",
      speed: "10-60x faster than AlphaFold2",
      validated: true,
    },
    tags: [
      "structure prediction",
      "language model",
      "single sequence",
      "fast",
      "ESM",
    ],
    version: "1.0.0",
    author: "Meta AI (FAIR)",
    usageCount: 22100,
    successRate: 0.88,
    learning: {
      conceptSummary:
        "ESMFold uses a protein language model (ESM-2) trained on millions of protein sequences to predict structure directly from a single sequence — no multiple sequence alignment needed. It learns implicit evolutionary information during language model pretraining, which it uses to infer structural contacts.",
      whyItMatters:
        "AlphaFold2 requires computing MSAs, which is slow and needs large sequence databases. ESMFold shows that a language model trained on enough protein sequences can internalize evolutionary patterns, enabling structure prediction in seconds rather than minutes. This makes it practical for high-throughput screening of millions of sequences.",
      keyInsight:
        "ESMFold demonstrates that protein language models learn the physics of protein folding implicitly during training. By predicting masked amino acids in millions of sequences, the model learns which residues interact — essentially rediscovering contact maps without ever seeing a 3D structure during language model training.",
      prerequisites: [
        "Basic protein structure concepts",
        "What a language model is (predict next/masked token)",
        "How AlphaFold2 works (for comparison)",
      ],
      commonMistakes: [
        "Using ESMFold when MSA-based methods would be better — for important predictions, AlphaFold2 is more accurate",
        "Not checking pTM scores — ESMFold's confidence metric; predictions below 0.5 pTM are unreliable",
        "Assuming ESMFold captures the same information as AlphaFold2 — they use fundamentally different signals",
      ],
      deepDiveTopics: [
        "Protein language models: BERT-style masked language modeling on sequences",
        "ESM-2 architecture and the attention maps that encode contact information",
        "Speed vs accuracy tradeoffs: when to use ESMFold vs AlphaFold2",
        "Emergent properties of large language models trained on biological sequences",
      ],
      relatedPapers: [
        {
          title:
            "Evolutionary-scale prediction of atomic-level protein structure with a language model",
          year: 2023,
          citation: "Lin et al., Science (2023)",
        },
        {
          title:
            "Language models of protein sequences at the scale of evolution enable accurate structure prediction",
          year: 2022,
          citation: "Lin et al., bioRxiv (2022)",
        },
      ],
      difficulty: "intermediate",
    },
  },
  {
    id: "evoprotgrad",
    name: "EvoProtGrad",
    displayName: "EvoProtGrad",
    description:
      "Directed evolution optimization using gradient-guided sequence design. Mimics the process of laboratory directed evolution in silico, using protein language model gradients to navigate fitness landscapes efficiently.",
    category: "protein",
    type: "specialized",
    moleculeTypes: ["protein"],
    functions: [
      "sequence optimization",
      "directed evolution",
      "fitness improvement",
    ],
    inputFormats: ["FASTA"],
    outputFormats: ["FASTA"],
    computeRequirements: {
      gpu: false,
      memory: "8 GB",
      timeEstimate: "10-60 min",
    },
    performance: {
      accuracy: "Depends on fitness landscape",
      speed: "Minutes per optimization round",
      validated: true,
    },
    tags: [
      "directed evolution",
      "optimization",
      "fitness landscape",
      "gradient",
    ],
    version: "0.9.0",
    author: "Microsoft Research",
    usageCount: 4300,
    successRate: 0.78,
    learning: {
      conceptSummary:
        "EvoProtGrad performs directed evolution computationally. Starting from a parent sequence, it uses gradients from protein language models to propose mutations that are likely to improve protein fitness (stability, activity, binding). Think of it as a GPS for navigating the vast space of possible protein sequences toward functional peaks.",
      whyItMatters:
        "Laboratory directed evolution (Nobel Prize 2018, Frances Arnold) works but is slow and expensive — each round takes weeks of cloning, expression, and screening. EvoProtGrad can explore millions of sequence variants in silico in minutes, pre-screening the most promising candidates before any wet lab work.",
      keyInsight:
        "The key innovation is using protein language model gradients as a proxy for fitness. Instead of randomly mutating and testing (like lab evolution), EvoProtGrad uses the language model's learned understanding of protein sequences to make informed mutations — moving uphill on the fitness landscape rather than wandering randomly.",
      prerequisites: [
        "Protein sequence basics and mutations",
        "The concept of a fitness landscape",
        "What directed evolution is (lab context)",
      ],
      commonMistakes: [
        "Optimizing without defining a clear fitness objective — the model needs guidance on what 'better' means",
        "Making too many mutations per round — gradual optimization is more reliable than large jumps",
        "Trusting computational predictions without experimental validation — always verify top candidates in the lab",
      ],
      deepDiveTopics: [
        "Fitness landscapes and the relationship between sequence and function",
        "Gradient-based vs sampling-based sequence optimization methods",
        "Epistasis: why mutations interact and single-mutant scanning isn't enough",
        "Comparison with Bayesian optimization approaches for protein engineering",
      ],
      relatedPapers: [
        {
          title:
            "EvoProtGrad: Efficient Differentiable Evolution-Guided Protein Design",
          year: 2023,
          citation: "Emami et al., NeurIPS ML4Molecules Workshop (2023)",
        },
      ],
      difficulty: "advanced",
    },
  },
  {
    id: "rfantibody",
    name: "RFAntibody",
    displayName: "RFAntibody",
    description:
      "Integrated antibody design pipeline combining structure prediction with sequence design. Generates antibody variable regions (VH/VL) optimized for target binding using RoseTTAFold-based architecture.",
    category: "antibody",
    type: "specialized",
    moleculeTypes: ["antibody", "protein"],
    functions: [
      "antibody design",
      "CDR optimization",
      "structure-based design",
    ],
    inputFormats: ["PDB"],
    outputFormats: ["PDB", "FASTA"],
    computeRequirements: {
      gpu: true,
      memory: "16 GB",
      timeEstimate: "30-90 min",
    },
    performance: {
      accuracy: "Competitive with experimental methods on benchmarks",
      speed: "Minutes per antibody design",
      validated: true,
    },
    tags: [
      "antibody",
      "CDR design",
      "therapeutic",
      "VH/VL",
      "immunology",
    ],
    version: "1.0.0",
    author: "Baker Lab",
    usageCount: 6800,
    successRate: 0.72,
    learning: {
      conceptSummary:
        "RFAntibody designs antibody variable regions computationally. Antibodies bind targets through six hypervariable loops called CDRs (Complementarity-Determining Regions). RFAntibody uses deep learning to design these CDR loops to bind a specified target protein surface, while maintaining the conserved antibody framework that ensures proper folding.",
      whyItMatters:
        "Traditional antibody discovery relies on immunizing animals or screening large phage display libraries — processes that take months and cost millions. Computational antibody design can generate diverse candidates in hours, dramatically accelerating the path from target to therapeutic lead.",
      keyInsight:
        "Antibody design is a constrained creativity problem. The framework regions (scaffold) must be conserved to maintain the immunoglobulin fold, but the CDR loops have enormous sequence and structural diversity. RFAntibody navigates this balance — creative in the CDRs, conservative in the framework.",
      prerequisites: [
        "Antibody structure basics (heavy chain, light chain, Fab, Fc)",
        "What CDRs are and why they determine specificity",
        "Protein-protein interactions and binding interfaces",
      ],
      commonMistakes: [
        "Designing without a high-quality target structure — garbage in, garbage out for the binding interface",
        "Ignoring developability — a designed antibody that binds well but aggregates or is immunogenic is useless therapeutically",
        "Not considering CDR length variation — CDR-H3 in particular varies from 3 to 30+ residues",
      ],
      deepDiveTopics: [
        "Antibody structure: VH/VL domains, CDR definitions (Chothia vs IMGT numbering)",
        "The germline gene repertoire and V(D)J recombination",
        "Affinity maturation: somatic hypermutation and selection",
        "Humanization and immunogenicity prediction for therapeutic antibodies",
      ],
      relatedPapers: [
        {
          title:
            "De novo design of protein structure and function with RFdiffusion",
          year: 2023,
          citation: "Watson et al., Nature (2023)",
        },
        {
          title:
            "Computational design of antibodies with improved binding affinity",
          year: 2023,
          citation: "Shanehsazzadeh et al., bioRxiv (2023)",
        },
      ],
      difficulty: "advanced",
    },
  },
  {
    id: "temstapro",
    name: "TemStaPro",
    displayName: "TemStaPro",
    description:
      "Thermostability prediction for protein sequences. Predicts whether a protein will remain folded and functional at elevated temperatures using protein language model embeddings, outputting stability classification and melting temperature estimates.",
    category: "assessment",
    type: "tool",
    moleculeTypes: ["protein"],
    functions: [
      "thermostability prediction",
      "stability assessment",
      "Tm estimation",
    ],
    inputFormats: ["FASTA"],
    outputFormats: ["CSV"],
    computeRequirements: {
      gpu: false,
      memory: "4 GB",
      timeEstimate: "1-5 min",
    },
    performance: {
      accuracy: "AUC > 0.85 on benchmark datasets",
      speed: "Seconds per sequence",
      validated: true,
    },
    tags: [
      "thermostability",
      "stability",
      "melting temperature",
      "assessment",
      "developability",
    ],
    version: "1.2.0",
    author: "Vilnius University",
    usageCount: 8900,
    successRate: 0.91,
    learning: {
      conceptSummary:
        "TemStaPro predicts protein thermostability — whether a protein will remain folded at elevated temperatures. It uses embeddings from protein language models to classify sequences as thermophilic (heat-stable) or mesophilic (normal temperature), and estimates the melting temperature (Tm) where the protein unfolds.",
      whyItMatters:
        "Thermostability is a critical property for drug development. A therapeutic protein that unfolds at body temperature (37°C) is useless. Computationally designed proteins often have marginal stability, so checking stability early in the pipeline saves expensive wet lab failures. It's also essential for industrial enzymes that must operate at high temperatures.",
      keyInsight:
        "Thermostability isn't just about temperature tolerance — it's a proxy for overall protein quality. Thermostable proteins tend to be more resistant to aggregation, proteolysis, and denaturation during manufacturing. In drug development, a stable binder beats a high-affinity aggregator every time.",
      prerequisites: [
        "Protein folding and the concept of free energy of folding",
        "What melting temperature (Tm) means",
        "Basic understanding of protein stability factors",
      ],
      commonMistakes: [
        "Treating stability predictions as absolute Tm values — they are estimates with significant uncertainty (±5°C typical)",
        "Only optimizing for stability without considering function — mutations that increase stability can kill activity",
        "Ignoring kinetic stability — TemStaPro predicts thermodynamic stability, but kinetic trapping can keep unstable proteins functional",
      ],
      deepDiveTopics: [
        "Thermodynamic vs kinetic protein stability",
        "The relationship between sequence composition and thermostability",
        "Consensus design and ancestral sequence reconstruction for stability",
        "High-throughput stability assays: nanoDSF, DSC, and cellular assays",
      ],
      relatedPapers: [
        {
          title:
            "TemStaPro: protein thermostability prediction using sequence representations from protein language models",
          year: 2024,
          citation: "Pudžiuvelytė et al., Bioinformatics (2024)",
        },
      ],
      difficulty: "beginner",
    },
  },
  {
    id: "geodock",
    name: "GeoDock",
    displayName: "GeoDock",
    description:
      "Geometric deep learning-based protein-protein docking. Predicts how two proteins interact and bind to each other by scoring and optimizing spatial arrangements of protein structures using SE(3)-equivariant neural networks.",
    category: "interaction",
    type: "specialized",
    moleculeTypes: ["protein", "complex"],
    functions: [
      "protein-protein docking",
      "binding pose prediction",
      "interaction scoring",
    ],
    inputFormats: ["PDB"],
    outputFormats: ["PDB", "CSV"],
    computeRequirements: {
      gpu: false,
      memory: "8 GB",
      timeEstimate: "10-60 min",
    },
    performance: {
      accuracy: "Competitive with HDOCK on rigid-body benchmarks",
      speed: "Minutes per docking run",
      validated: true,
    },
    tags: [
      "docking",
      "protein-protein interaction",
      "binding",
      "complex",
      "geometric deep learning",
    ],
    version: "0.8.0",
    author: "Octavian-Vlad Murad",
    usageCount: 3200,
    successRate: 0.75,
    learning: {
      conceptSummary:
        "GeoDock predicts how two proteins physically interact by finding the optimal relative orientation and position (the docking pose). It uses SE(3)-equivariant geometric deep learning to score and refine protein-protein arrangements, identifying the binding interface where the two proteins make contact.",
      whyItMatters:
        "Most biological functions depend on protein-protein interactions — from signal transduction to immune recognition. Predicting how proteins dock is essential for understanding disease mechanisms and designing drugs that block or enhance specific interactions. It's particularly critical in antibody-antigen binding prediction.",
      keyInsight:
        "Protein docking is fundamentally a search problem in 6D space (3 translations + 3 rotations). The challenge isn't just finding low-energy poses — it's distinguishing the true binding mode from thousands of decoys that look energetically reasonable. Geometric deep learning helps by learning the structural signatures of true interfaces.",
      prerequisites: [
        "Protein surface properties and electrostatics",
        "Concepts of binding affinity and dissociation constant (Kd)",
        "Rigid body transformations (rotation and translation)",
      ],
      commonMistakes: [
        "Docking with predicted structures without considering their accuracy — errors in monomer structures propagate to docking",
        "Assuming the top-scored pose is correct — always examine multiple top poses and look for consensus",
        "Ignoring flexibility — real proteins change shape upon binding (induced fit), but rigid docking misses this",
        "Not validating against known experimental data when available",
      ],
      deepDiveTopics: [
        "SE(3) equivariance and why it matters for molecular modeling",
        "Rigid-body vs flexible docking and the induced fit problem",
        "Scoring functions: physics-based vs knowledge-based vs ML-based",
        "Integration with molecular dynamics for binding free energy estimation",
      ],
      relatedPapers: [
        {
          title:
            "GeoDock: SE(3)-equivariant geometric learning for protein-protein docking",
          year: 2023,
          citation: "Murad et al., ICLR Workshop (2023)",
        },
        {
          title:
            "DiffDock: Diffusion Steps, Twists, and Turns for Molecular Docking",
          year: 2023,
          citation: "Corso et al., ICLR (2023)",
        },
      ],
      difficulty: "advanced",
    },
  },
];

export function getModuleById(id: string): ModuleMetadata | undefined {
  return MODULE_CATALOG.find((m) => m.id === id);
}
