// ---------------------------------------------------------------------------
// module-case-studies.ts
// Real paper case studies for each bioinformatics module.
// Every entry references a published (or preprint) paper with a valid DOI.
// ---------------------------------------------------------------------------

export interface CaseStudy {
  paperTitle: string;
  authors: string;
  year: number;
  journal: string;
  doi: string;
  summary: string;
  keyTakeaway: string;
}

export const MODULE_CASE_STUDIES: Record<string, CaseStudy[]> = {
  // -----------------------------------------------------------------------
  // 1. RFdiffusion — De novo protein structure generation via diffusion
  // -----------------------------------------------------------------------
  rfdiffusion: [
    {
      paperTitle:
        "De novo design of protein structure and function with RFdiffusion",
      authors: "Watson et al.",
      year: 2023,
      journal: "Nature",
      doi: "https://doi.org/10.1038/s41586-023-06415-8",
      summary:
        "The authors fine-tuned the RoseTTAFold structure prediction network on protein structure denoising tasks to create RFdiffusion, a generative model capable of designing novel protein backbones from scratch. They experimentally validated hundreds of designs including symmetric oligomers, enzyme active site scaffolds, and therapeutic protein binders, demonstrating that diffusion-based generation can produce physically realizable proteins across a wide range of design challenges.",
      keyTakeaway:
        "Diffusion models can generate entirely new protein backbones that fold and function as designed, opening the door to on-demand protein engineering.",
    },
    {
      paperTitle:
        "Design of protein-binding proteins from the target structure alone",
      authors: "Cao et al.",
      year: 2022,
      journal: "Nature",
      doi: "https://doi.org/10.1038/s41586-022-04654-9",
      summary:
        "Cao and colleagues developed a computational pipeline to design small protein binders (under 65 amino acids) given only the three-dimensional structure of a target protein, without requiring any known binding scaffold. After experimental optimization the designed binders achieved nanomolar to picomolar binding affinities, demonstrating that structure-based computational design can rival the potency of antibodies.",
      keyTakeaway:
        "Computationally designed miniproteins can bind targets with picomolar affinity, rivaling natural antibodies in potency while being much smaller and easier to produce.",
    },
    {
      paperTitle:
        "Generalized biomolecular modeling and design with RoseTTAFold All-Atom",
      authors: "Krishna et al.",
      year: 2024,
      journal: "Science",
      doi: "https://doi.org/10.1126/science.adl2528",
      summary:
        "This work extended the RoseTTAFold architecture to handle proteins, nucleic acids, small molecules, metals, and covalent modifications in a unified all-atom representation. By fine-tuning on denoising tasks the authors created RFdiffusion All-Atom, which can build protein structures around small-molecule ligands and other non-protein components, broadening the scope of diffusion-based design beyond protein-only systems.",
      keyTakeaway:
        "Extending diffusion models to all-atom representations lets you co-design proteins together with small molecules, metals, and nucleic acids in a single framework.",
    },
  ],

  // -----------------------------------------------------------------------
  // 2. ProteinMPNN — Sequence design / inverse folding
  // -----------------------------------------------------------------------
  proteinmpnn: [
    {
      paperTitle:
        "Robust deep learning-based protein sequence design using ProteinMPNN",
      authors: "Dauparas et al.",
      year: 2022,
      journal: "Science",
      doi: "https://doi.org/10.1126/science.add2187",
      summary:
        "Dauparas and colleagues introduced ProteinMPNN, a message-passing neural network that predicts amino acid sequences likely to fold into a given backbone structure. Across 100 designs tested experimentally, the method achieved significantly higher success rates than physics-based tools like Rosetta, with many designs expressing as soluble, monomeric proteins that matched the target structure by X-ray crystallography.",
      keyTakeaway:
        "ProteinMPNN dramatically outperforms traditional energy-based sequence design, making it the default tool for fixed-backbone inverse folding.",
    },
    {
      paperTitle:
        "Learning inverse folding from millions of predicted structures",
      authors: "Hsu et al.",
      year: 2022,
      journal: "ICML (PMLR vol. 162)",
      doi: "https://doi.org/10.1101/2022.04.10.487779",
      summary:
        "The authors trained a structure-conditioned language model (ESM-IF1) on nearly 12 million AlphaFold2-predicted structures, augmenting the training set by three orders of magnitude over experimentally solved structures alone. ESM-IF1 achieved 51% native sequence recovery overall and 72% for buried residues, and generalized to complex tasks including multi-state design and interface design.",
      keyTakeaway:
        "Training inverse folding models on millions of predicted structures rather than just experimental ones substantially improves sequence recovery and generalization.",
    },
    {
      paperTitle: "Hallucinating symmetric protein assemblies",
      authors: "Wicky et al.",
      year: 2022,
      journal: "Science",
      doi: "https://doi.org/10.1126/science.add1964",
      summary:
        "Wicky and colleagues used deep-network hallucination to generate novel symmetric protein homo-oligomers from scratch, specifying only the number of subunits and chain length. The hallucinated backbones were then threaded with sequences designed by ProteinMPNN, and many assembled into the target oligomeric states with high stability, confirmed by cryo-EM structures matching the computational models.",
      keyTakeaway:
        "Combining backbone hallucination with ProteinMPNN sequence design enables the creation of symmetric protein assemblies that have never existed in nature.",
    },
  ],

  // -----------------------------------------------------------------------
  // 3. AlphaFold2 — Structure prediction
  // -----------------------------------------------------------------------
  alphafold2: [
    {
      paperTitle:
        "Highly accurate protein structure prediction with AlphaFold",
      authors: "Jumper et al.",
      year: 2021,
      journal: "Nature",
      doi: "https://doi.org/10.1038/s41586-021-03819-2",
      summary:
        "Jumper and colleagues presented AlphaFold2, a deep learning system that predicts three-dimensional protein structures from amino acid sequence with atomic-level accuracy. At the CASP14 competition, AlphaFold2 achieved a median GDT score of 92.4 across all targets, reaching accuracy competitive with experimental methods for the majority of proteins tested.",
      keyTakeaway:
        "AlphaFold2 solved the decades-old protein structure prediction problem, achieving experimental-level accuracy from sequence alone.",
    },
    {
      paperTitle:
        "AlphaFold Protein Structure Database: massively expanding the structural coverage of protein-sequence space with high-accuracy models",
      authors: "Varadi et al.",
      year: 2022,
      journal: "Nucleic Acids Research",
      doi: "https://doi.org/10.1093/nar/gkab1061",
      summary:
        "This paper introduced the AlphaFold Protein Structure Database (AlphaFold DB), providing open access to over 200 million predicted protein structures covering nearly every known protein sequence. The database includes per-residue confidence scores (pLDDT) so researchers can assess prediction reliability, and has become one of the most widely used resources in structural biology.",
      keyTakeaway:
        "The AlphaFold database provides free predicted structures for virtually every known protein, transforming structural biology from a bottleneck into an accessible resource.",
    },
    {
      paperTitle:
        "Highly accurate protein structure prediction for the human proteome",
      authors: "Tunyasuvunakool et al.",
      year: 2021,
      journal: "Nature",
      doi: "https://doi.org/10.1038/s41586-021-03828-1",
      summary:
        "The authors applied AlphaFold2 to predict structures covering 98.5% of the human proteome, with 58% of residues modeled at high confidence and 36% at very high confidence. This proteome-scale application revealed that many previously uncharacterized human proteins contain structured domains amenable to functional annotation, drug targeting, and mechanistic study.",
      keyTakeaway:
        "Applying AlphaFold2 across an entire proteome reveals thousands of confidently predicted structures for proteins that had no prior experimental characterization.",
    },
  ],

  // -----------------------------------------------------------------------
  // 4. ESMFold — Language model structure prediction
  // -----------------------------------------------------------------------
  esmfold: [
    {
      paperTitle:
        "Evolutionary-scale prediction of atomic-level protein structure with a language model",
      authors: "Lin et al.",
      year: 2023,
      journal: "Science",
      doi: "https://doi.org/10.1126/science.ade2574",
      summary:
        "Lin and colleagues demonstrated that a 15-billion-parameter protein language model trained solely on sequences learns sufficient structural information to predict three-dimensional protein structures without requiring multiple sequence alignments. ESMFold achieves accuracy approaching AlphaFold2 on many targets while running up to 60 times faster, enabling rapid structural annotation of metagenomic sequences at the scale of hundreds of millions of proteins.",
      keyTakeaway:
        "ESMFold shows that protein language models implicitly learn structural information from sequences alone, enabling fast structure prediction without alignment databases.",
    },
    {
      paperTitle:
        "Biological structure and function emerge from scaling unsupervised learning to 250 million protein sequences",
      authors: "Rives et al.",
      year: 2021,
      journal: "PNAS",
      doi: "https://doi.org/10.1073/pnas.2016239118",
      summary:
        "Rives and colleagues trained transformer language models on 250 million diverse protein sequences and showed that the learned representations capture biological properties at multiple scales, from amino acid biochemistry to remote protein homology. The ESM model representations enabled state-of-the-art performance on downstream tasks including secondary structure prediction, contact prediction, and variant effect prediction, establishing the foundation that ESMFold later built upon.",
      keyTakeaway:
        "Scaling unsupervised language models to hundreds of millions of protein sequences reveals that evolutionary information encodes rich structural and functional knowledge.",
    },
  ],

  // -----------------------------------------------------------------------
  // 5. EvoProtGrad — Directed evolution optimization
  // -----------------------------------------------------------------------
  evoprotgrad: [
    {
      paperTitle:
        "Plug & play directed evolution of proteins with gradient-based discrete MCMC",
      authors: "Emami et al.",
      year: 2023,
      journal: "Machine Learning: Science and Technology",
      doi: "https://doi.org/10.1088/2632-2153/accacd",
      summary:
        "Emami and colleagues introduced EvoProtGrad, a framework that performs directed evolution in silico by combining gradient-based discrete MCMC sampling with plug-and-play expert models. Users can compose pretrained protein language models with custom fitness predictors to guide sequence search, enabling efficient exploration of the fitness landscape without retraining any model.",
      keyTakeaway:
        "EvoProtGrad lets you compose pretrained language models with task-specific fitness functions to perform in silico directed evolution without retraining.",
    },
    {
      paperTitle:
        "Efficient evolution of human antibodies from general protein language models",
      authors: "Hie et al.",
      year: 2024,
      journal: "Nature Biotechnology",
      doi: "https://doi.org/10.1038/s41587-023-01763-2",
      summary:
        "Hie and colleagues used general-purpose protein language models to guide the directed evolution of seven human antibodies, screening only 20 or fewer variants per antibody across two rounds of laboratory evolution. Without any antigen or structural information, the language-model-guided approach improved binding affinities up to 7-fold for mature clinical antibodies and up to 160-fold for unmatured antibodies.",
      keyTakeaway:
        "General protein language models can guide real-world directed evolution campaigns, dramatically reducing the number of variants that need to be screened in the lab.",
    },
    {
      paperTitle:
        "Innovation by Evolution: Bringing New Chemistry to Life (Nobel Lecture)",
      authors: "Arnold F.H.",
      year: 2019,
      journal: "Angewandte Chemie International Edition",
      doi: "https://doi.org/10.1002/anie.201907729",
      summary:
        "In her Nobel Lecture, Frances Arnold described three decades of work developing directed evolution as a practical engineering strategy for enzymes and other proteins. She outlined how iterative rounds of random mutagenesis and screening can navigate vast sequence spaces to find proteins with new or improved catalytic activities, laying the conceptual foundation that computational directed evolution methods now aim to accelerate.",
      keyTakeaway:
        "Directed evolution, recognized with the 2018 Nobel Prize in Chemistry, is the foundational paradigm that computational tools like EvoProtGrad aim to accelerate and democratize.",
    },
  ],

  // -----------------------------------------------------------------------
  // 6. RFAntibody — Antibody design
  // -----------------------------------------------------------------------
  rfantibody: [
    {
      paperTitle:
        "De novo design of protein structure and function with RFdiffusion",
      authors: "Watson et al.",
      year: 2023,
      journal: "Nature",
      doi: "https://doi.org/10.1038/s41586-023-06415-8",
      summary:
        "Beyond general protein design, Watson and colleagues demonstrated that RFdiffusion can generate novel protein binders targeting specific epitopes on therapeutic targets, including viral surface proteins. The binder design pipeline incorporates hotspot-guided diffusion where key interface residues are specified, allowing the model to scaffold binding interfaces that achieve high affinity and specificity in experimental validation.",
      keyTakeaway:
        "RFdiffusion can scaffold antibody-like binders around specified epitope contacts, providing a powerful starting point for therapeutic protein design.",
    },
    {
      paperTitle:
        "Unlocking de novo antibody design with generative artificial intelligence",
      authors: "Shanehsazzadeh et al.",
      year: 2023,
      journal: "bioRxiv",
      doi: "https://doi.org/10.1101/2023.01.08.523187",
      summary:
        "Shanehsazzadeh and colleagues used generative deep learning models to design antibodies de novo against three distinct protein targets in a zero-shot fashion, with no iterative optimization after the initial model generation. Experimental validation showed that several generated antibodies bound their targets, marking one of the first demonstrations that generative AI can produce functional antibodies without starting from a known binder scaffold.",
      keyTakeaway:
        "Generative AI models can design functional antibodies from scratch in a single pass, without requiring a known starting antibody or iterative optimization.",
    },
    {
      paperTitle:
        "Inverse folding for antibody sequence design using deep learning",
      authors: "Dreyer et al.",
      year: 2023,
      journal: "arXiv (ICML Workshop on Computational Biology)",
      doi: "https://doi.org/10.48550/arXiv.2310.19513",
      summary:
        "Dreyer and colleagues fine-tuned inverse folding models specifically for antibody structures, creating AbMPNN which accounts for the unique structural constraints of immunoglobulin folds. The antibody-specific model significantly outperformed generic protein inverse folding on CDR sequence recovery, particularly for the hypervariable CDR-H3 loop, which is critical for antigen recognition.",
      keyTakeaway:
        "Fine-tuning inverse folding models specifically on antibody structures dramatically improves sequence design for the hardest-to-predict CDR loops.",
    },
  ],

  // -----------------------------------------------------------------------
  // 7. TemStaPro — Thermostability prediction
  // -----------------------------------------------------------------------
  temstapro: [
    {
      paperTitle:
        "TemStaPro: protein thermostability prediction using sequence representations from protein language models",
      authors: "Pudziuvelyte et al.",
      year: 2024,
      journal: "Bioinformatics",
      doi: "https://doi.org/10.1093/bioinformatics/btae157",
      summary:
        "Pudziuvelyte and colleagues applied transfer learning from protein language models to predict whether a protein is thermostable, training on over one million sequences from organisms with annotated optimal growth temperatures. TemStaPro classifies proteins as thermophilic or mesophilic using only sequence embeddings, requiring no structural input, and achieves high accuracy across diverse protein families.",
      keyTakeaway:
        "Protein language model embeddings capture enough biophysical signal to predict thermostability directly from sequence, without needing a 3D structure.",
    },
    {
      paperTitle:
        "Mega-scale experimental analysis of protein folding stability in biology and design",
      authors: "Tsuboyama et al.",
      year: 2023,
      journal: "Nature",
      doi: "https://doi.org/10.1038/s41586-023-06328-6",
      summary:
        "Tsuboyama and colleagues developed cDNA display proteolysis to measure thermodynamic folding stability for up to 900,000 protein domains in a single experiment, producing approximately 776,000 high-quality stability measurements covering all single amino acid variants of 331 natural and 148 designed domains. This massive dataset revealed systematic patterns in how mutations affect stability, providing ground-truth benchmarks for computational stability predictors like TemStaPro.",
      keyTakeaway:
        "Mega-scale experimental stability data provides the ground truth needed to train and validate computational thermostability prediction tools.",
    },
  ],

  // -----------------------------------------------------------------------
  // 8. GeoDock — Protein-protein docking
  // -----------------------------------------------------------------------
  geodock: [
    {
      paperTitle:
        "Flexible protein-protein docking with a multitrack iterative transformer",
      authors: "Chu et al.",
      year: 2024,
      journal: "Protein Science",
      doi: "https://doi.org/10.1002/pro.4862",
      summary:
        "Chu, Ruffolo, Harmalkar, and Gray introduced GeoDock, a multitrack iterative transformer that predicts docked protein complex structures from the individual partner structures and sequences, without requiring multiple sequence alignments. GeoDock models residue-level flexibility during docking and achieves a 43% top-1 success rate on the DIPS benchmark with sub-second inference on a single GPU, making it practical for large-scale screening of protein-protein interactions.",
      keyTakeaway:
        "GeoDock combines speed and flexibility-awareness to dock protein pairs in under a second, enabling high-throughput computational screening of interactions.",
    },
    {
      paperTitle:
        "DiffDock: Diffusion Steps, Twists, and Turns for Molecular Docking",
      authors: "Corso et al.",
      year: 2023,
      journal: "ICLR",
      doi: "https://doi.org/10.48550/arXiv.2210.01776",
      summary:
        "Corso and colleagues reframed molecular docking as a generative modeling problem, applying diffusion over the manifold of ligand poses to sample plausible binding configurations. DiffDock achieved a 38% top-1 success rate on PDBBind, substantially outperforming both traditional docking software (23%) and prior deep learning methods (20%), demonstrating the power of generative approaches for predicting molecular interactions.",
      keyTakeaway:
        "Treating docking as a generative diffusion process rather than a scoring optimization yields significant accuracy gains over classical docking methods.",
    },
    {
      paperTitle: "Protein complex prediction with AlphaFold-Multimer",
      authors: "Evans et al.",
      year: 2022,
      journal: "bioRxiv",
      doi: "https://doi.org/10.1101/2021.10.04.463034",
      summary:
        "Evans and colleagues adapted AlphaFold for multimeric protein complex prediction, training on protein complexes of known stoichiometry to produce AlphaFold-Multimer. The model significantly improved the accuracy of predicted inter-chain interfaces compared to repurposing single-chain AlphaFold, while maintaining high intra-chain accuracy, establishing a strong baseline for all subsequent deep learning docking methods.",
      keyTakeaway:
        "AlphaFold-Multimer set the benchmark for deep learning-based complex prediction, showing that end-to-end structure prediction can capture protein-protein interfaces.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export function getCaseStudiesForModule(moduleId: string): CaseStudy[] {
  return MODULE_CASE_STUDIES[moduleId] ?? [];
}
