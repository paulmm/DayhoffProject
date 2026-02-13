export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const MODULE_QUIZZES: Record<string, QuizQuestion[]> = {
  // ─────────────────────────────────────────────
  // MODULE 1: RFdiffusion
  // ─────────────────────────────────────────────
  rfdiffusion: [
    {
      id: "rfdiffusion-q1",
      question:
        "What does RFdiffusion generate as its primary output?",
      options: [
        "A full protein sequence with side chains",
        "A protein backbone structure (no sequence)",
        "A folded protein with predicted binding affinity",
        "An amino acid sequence optimized for stability",
      ],
      correctIndex: 1,
      explanation:
        "RFdiffusion generates novel protein backbone structures (the chain of N, CA, C atoms) but does not assign amino acid sequences. A separate tool like ProteinMPNN is needed to design sequences that fold into the generated backbone.",
      difficulty: "beginner",
    },
    {
      id: "rfdiffusion-q2",
      question:
        "Which fundamental process does a diffusion model reverse in order to generate new structures?",
      options: [
        "Protein folding from a denatured state",
        "The gradual addition of noise to training data",
        "Molecular dynamics simulation of thermal motion",
        "Evolutionary divergence of homologous proteins",
      ],
      correctIndex: 1,
      explanation:
        "Diffusion models work by learning to reverse a forward noise process. During training, structured data is progressively corrupted with noise. The model then learns to denoise step by step, allowing it to generate new structures by starting from pure noise and iteratively removing it.",
      difficulty: "beginner",
    },
    {
      id: "rfdiffusion-q3",
      question:
        "Why is SE(3) equivariance an important property for RFdiffusion's neural network architecture?",
      options: [
        "It allows the model to process sequences of any length without retraining",
        "It ensures the generated structures are always thermostable",
        "It guarantees that rotating or translating the input produces equivalently transformed outputs, respecting the physics of 3D space",
        "It prevents the model from generating structures that clash with known PDB entries",
      ],
      correctIndex: 2,
      explanation:
        "SE(3) equivariance means the model treats 3D structures consistently regardless of their orientation or position in space. If you rotate an input, the output rotates identically. This is essential because protein physics does not depend on where or how a protein is oriented in a coordinate system.",
      difficulty: "intermediate",
    },
    {
      id: "rfdiffusion-q4",
      question:
        "In RFdiffusion, what role do 'hotspot residues' play during conditional generation?",
      options: [
        "They specify residues that should be mutated to improve stability",
        "They define target residues on a binding partner that the designed protein should contact",
        "They mark regions of the backbone that should remain disordered",
        "They indicate positions where disulfide bonds must form",
      ],
      correctIndex: 1,
      explanation:
        "Hotspot residues are specific residues on a target protein that you want the newly designed protein to interact with. By conditioning generation on these hotspots, RFdiffusion creates backbones that are shaped to make contacts at those key positions, enabling targeted binder design.",
      difficulty: "intermediate",
    },
    {
      id: "rfdiffusion-q5",
      question:
        "A researcher uses RFdiffusion to generate 100 novel backbone structures for a binder targeting IL-17. They then run ProteinMPNN on each backbone and select the top candidates by AlphaFold2 predicted confidence. Which of the following is the most critical limitation of this computational pipeline that the researcher must address?",
      options: [
        "AlphaFold2 cannot predict structures longer than 100 residues",
        "RFdiffusion backbones are always left-handed helices that ProteinMPNN cannot handle",
        "None of the computational metrics guarantee that designs will actually fold, bind, or function in the lab, so experimental validation is essential",
        "ProteinMPNN can only design sequences for naturally occurring protein folds",
      ],
      correctIndex: 2,
      explanation:
        "While this computational pipeline is powerful, every stage involves predictions with inherent uncertainty. High AlphaFold2 confidence does not guarantee a protein will fold correctly, bind its target, or be expressible. Experimental validation through expression, purification, and binding assays is an irreplaceable step in any protein design workflow.",
      difficulty: "advanced",
    },
  ],

  // ─────────────────────────────────────────────
  // MODULE 2: ProteinMPNN
  // ─────────────────────────────────────────────
  proteinmpnn: [
    {
      id: "proteinmpnn-q1",
      question:
        "What problem does ProteinMPNN solve?",
      options: [
        "Predicting the 3D structure of a protein from its sequence",
        "Designing an amino acid sequence that will fold into a given backbone structure",
        "Simulating how a protein unfolds at high temperatures",
        "Identifying evolutionary relationships between protein families",
      ],
      correctIndex: 1,
      explanation:
        "ProteinMPNN solves the inverse folding problem: given a desired 3D backbone structure, it designs amino acid sequences predicted to fold into that shape. This is the reverse of structure prediction, which goes from sequence to structure.",
      difficulty: "beginner",
    },
    {
      id: "proteinmpnn-q2",
      question:
        "Why is it standard practice to generate multiple sequence candidates with ProteinMPNN rather than just one?",
      options: [
        "Because the software has a high error rate and most outputs are corrupted",
        "Because many different sequences can fold into similar structures, and sampling multiple candidates increases the chance of finding one that works experimentally",
        "Because each run produces only a partial sequence that must be assembled",
        "Because a single sequence always folds into multiple different structures",
      ],
      correctIndex: 1,
      explanation:
        "The sequence-structure relationship is many-to-one: many distinct sequences can fold into very similar backbone conformations. By sampling multiple candidates, you explore this sequence space and increase the likelihood of finding designs that are not only structurally correct but also expressible, soluble, and functional.",
      difficulty: "beginner",
    },
    {
      id: "proteinmpnn-q3",
      question:
        "In ProteinMPNN, what is the effect of increasing the sampling temperature?",
      options: [
        "It makes the model run faster by reducing computational precision",
        "It increases sequence diversity but may reduce the reliability of each individual design",
        "It forces the model to only output hydrophobic residues",
        "It restricts the output to sequences found in the PDB training set",
      ],
      correctIndex: 1,
      explanation:
        "The sampling temperature controls the trade-off between diversity and confidence. A higher temperature flattens the probability distribution over amino acids, producing more diverse but less conservative sequences. A lower temperature concentrates probability on the most likely residues, yielding safer but more similar designs. The right setting depends on whether you need to explore broadly or stay close to known solutions.",
      difficulty: "intermediate",
    },
    {
      id: "proteinmpnn-q4",
      question:
        "ProteinMPNN uses a message passing neural network architecture. What does 'message passing' refer to in this context?",
      options: [
        "The model sends intermediate results to a remote server for distributed computation",
        "Nodes in a graph iteratively exchange and aggregate information with their neighbors to build context-aware representations",
        "The model reads the protein sequence one residue at a time from left to right like a language model",
        "Error signals are passed backward through the network during training only",
      ],
      correctIndex: 1,
      explanation:
        "In a message passing neural network, the protein structure is represented as a graph where residues are nodes and spatial relationships are edges. Each node iteratively sends and receives 'messages' from its neighbors, building up a rich representation that captures both local geometry and longer-range structural context. This is what allows ProteinMPNN to make sequence decisions informed by the full structural environment.",
      difficulty: "intermediate",
    },
    {
      id: "proteinmpnn-q5",
      question:
        "A researcher designs sequences for a symmetric homo-trimer using ProteinMPNN. They fix certain interface residues and let the model design the rest. After AlphaFold2 validation, the top candidate shows high pLDDT for each monomer but the predicted complex structure does not form the intended trimeric interface. What is the most likely explanation?",
      options: [
        "AlphaFold2 cannot predict structures with more than one chain",
        "ProteinMPNN always produces sequences for monomers even when given multimeric inputs",
        "The designed sequences may fold well individually but the inter-chain interactions were not sufficiently captured or constrained during design, leading to a sequence that favors alternative packing arrangements",
        "Fixing interface residues always prevents the model from designing functional proteins",
      ],
      correctIndex: 2,
      explanation:
        "Designing for oligomeric assemblies is harder than monomer design. Each chain may fold well on its own (high pLDDT per monomer) but the designed interface residues may not encode the specific interactions needed for the intended quaternary arrangement. This highlights the importance of explicitly modeling and validating inter-chain contacts, using multi-state design strategies, and checking the predicted complex, not just individual chains.",
      difficulty: "advanced",
    },
  ],

  // ─────────────────────────────────────────────
  // MODULE 3: AlphaFold2
  // ─────────────────────────────────────────────
  alphafold2: [
    {
      id: "alphafold2-q1",
      question:
        "What is the primary input that AlphaFold2 requires to predict a protein's 3D structure?",
      options: [
        "A cryo-EM density map",
        "An amino acid sequence (and its multiple sequence alignment)",
        "A protein's experimentally measured melting temperature",
        "A homologous protein's crystal structure as a template",
      ],
      correctIndex: 1,
      explanation:
        "AlphaFold2 takes an amino acid sequence as input and searches databases to build a multiple sequence alignment (MSA). The MSA provides co-evolutionary information that the model uses alongside the sequence to predict the protein's 3D structure. While templates can help, the MSA-based approach is what gives AlphaFold2 much of its power.",
      difficulty: "beginner",
    },
    {
      id: "alphafold2-q2",
      question:
        "What does the pLDDT score in AlphaFold2 predictions represent?",
      options: [
        "The probability that the protein will be expressed in E. coli",
        "The predicted binding affinity to a known drug",
        "A per-residue confidence estimate of how accurate the predicted structure is at each position",
        "The percentage of the sequence that aligns to known PDB structures",
      ],
      correctIndex: 2,
      explanation:
        "pLDDT (predicted Local Distance Difference Test) is a per-residue confidence score ranging from 0 to 100. High pLDDT (above 90) indicates the model is confident in the local structure at that position. Low pLDDT (below 50) often indicates disordered regions or areas where the prediction is unreliable. It is a measure of structural confidence, not biological function.",
      difficulty: "beginner",
    },
    {
      id: "alphafold2-q3",
      question:
        "Why does AlphaFold2 rely heavily on multiple sequence alignments (MSAs) rather than just the single input sequence?",
      options: [
        "MSAs are needed to determine the molecular weight of the protein",
        "Co-evolving residue pairs in the MSA reveal spatial contacts, providing powerful distance constraints for structure prediction",
        "MSAs replace the need for any neural network computation",
        "Single sequences contain too few atoms for physics-based modeling",
      ],
      correctIndex: 1,
      explanation:
        "When two residues are in physical contact in a protein structure, mutations at one position create evolutionary pressure for compensatory mutations at the other. These co-evolutionary signals, extracted from MSAs of homologous sequences, effectively encode distance constraints between residue pairs. AlphaFold2's Evoformer module is specifically designed to extract and reason about these correlated mutation patterns.",
      difficulty: "intermediate",
    },
    {
      id: "alphafold2-q4",
      question:
        "Which of the following is a well-known limitation of AlphaFold2?",
      options: [
        "It cannot predict alpha-helices, only beta-sheets",
        "It predicts a single static structure and does not capture conformational dynamics or multiple functional states",
        "It only works on proteins shorter than 50 amino acids",
        "It requires experimental NMR data as a mandatory input",
      ],
      correctIndex: 1,
      explanation:
        "AlphaFold2 predicts a single static structure for a given sequence, which is typically close to the most stable conformation. However, many proteins function by switching between multiple conformational states (e.g., open/closed, active/inactive). AlphaFold2 does not model these dynamics, ensembles, or the effects of ligand binding, which is an important limitation for understanding protein function.",
      difficulty: "intermediate",
    },
    {
      id: "alphafold2-q5",
      question:
        "A researcher uses AlphaFold2 to predict the structure of a newly discovered bacterial protein. The prediction shows uniformly high pLDDT (>90) across all residues. The researcher concludes that the structure is experimentally accurate and proceeds to use it for drug docking without further validation. What is the most significant flaw in this reasoning?",
      options: [
        "pLDDT above 90 actually indicates the prediction is incorrect",
        "High pLDDT reflects model confidence in its prediction, not ground truth accuracy. It can be confidently wrong, especially for proteins unlike those in the training data, and drug docking requires accurate side-chain and binding-site geometry that may not be reliable even with high confidence scores",
        "AlphaFold2 predictions are always accurate when pLDDT is above 90, so there is no flaw",
        "Drug docking only works with NMR structures, never computational predictions",
      ],
      correctIndex: 1,
      explanation:
        "High pLDDT means the model is confident, not that it is correct. For proteins that are genuinely novel or have features not well represented in training data, AlphaFold2 can be confidently wrong. Furthermore, drug docking is highly sensitive to the precise geometry of binding sites, including side-chain rotamers and local backbone accuracy, which may have subtle errors even in high-confidence regions. Independent experimental validation remains critical before making drug design decisions.",
      difficulty: "advanced",
    },
  ],

  // ─────────────────────────────────────────────
  // MODULE 4: ESMFold
  // ─────────────────────────────────────────────
  esmfold: [
    {
      id: "esmfold-q1",
      question:
        "What is the key advantage of ESMFold over AlphaFold2 in terms of input requirements?",
      options: [
        "ESMFold requires a crystal structure as input while AlphaFold2 does not",
        "ESMFold needs only a single protein sequence with no multiple sequence alignment",
        "ESMFold requires GPU clusters while AlphaFold2 runs on CPUs only",
        "ESMFold works exclusively on membrane proteins",
      ],
      correctIndex: 1,
      explanation:
        "ESMFold predicts protein structures from a single amino acid sequence without needing a multiple sequence alignment (MSA). This eliminates the time-consuming database search step required by AlphaFold2, making ESMFold significantly faster. The protein language model at ESMFold's core has already learned implicit evolutionary information during pretraining on millions of protein sequences.",
      difficulty: "beginner",
    },
    {
      id: "esmfold-q2",
      question:
        "How does ESMFold capture evolutionary information without building an explicit MSA?",
      options: [
        "It downloads pre-computed MSAs from the UniProt database at runtime",
        "Its underlying protein language model learned patterns of amino acid co-occurrence and conservation during pretraining on millions of sequences",
        "It uses a physics-based force field instead of evolutionary data",
        "It cannot capture evolutionary information, which is why it is always less accurate",
      ],
      correctIndex: 1,
      explanation:
        "ESMFold is built on a protein language model (ESM-2) that was pretrained on tens of millions of protein sequences using masked language modeling. Through this process, the model implicitly learns evolutionary constraints, residue co-variation patterns, and structural preferences, effectively encoding much of the information that MSAs provide explicitly.",
      difficulty: "beginner",
    },
    {
      id: "esmfold-q3",
      question:
        "The pTM (predicted Template Modeling) score is a key confidence metric for ESMFold. What does a low pTM score suggest about a prediction?",
      options: [
        "The protein is guaranteed to be disordered in nature",
        "The overall global fold of the predicted structure is unreliable and should be interpreted with caution",
        "The protein sequence was too short for the model to process",
        "The prediction will exactly match an experimental crystal structure",
      ],
      correctIndex: 1,
      explanation:
        "The pTM score estimates how well the overall predicted fold would match the true structure, on a scale from 0 to 1. A low pTM (below roughly 0.5) indicates that the model is not confident in the global topology of the predicted structure. This may happen for intrinsically disordered proteins, orphan sequences without evolutionary relatives, or genuinely novel folds that the model struggles with.",
      difficulty: "intermediate",
    },
    {
      id: "esmfold-q4",
      question:
        "In which scenario would you choose ESMFold over AlphaFold2?",
      options: [
        "When you need the absolute highest possible accuracy on a well-characterized protein family with deep MSAs available",
        "When you need rapid structure predictions for thousands of sequences in a high-throughput screen and can accept a small trade-off in accuracy",
        "When you want to predict protein-DNA interactions",
        "When the protein has already been crystallized and you need to refine the experimental structure",
      ],
      correctIndex: 1,
      explanation:
        "ESMFold's single-sequence approach makes it dramatically faster than AlphaFold2 because it skips the MSA construction step. This makes it ideal for high-throughput applications where you need to screen thousands of sequences quickly, such as filtering a large library of designed sequences before running more expensive AlphaFold2 predictions on the top candidates. The trade-off is that ESMFold is generally slightly less accurate, especially for proteins where deep MSAs provide critical information.",
      difficulty: "intermediate",
    },
    {
      id: "esmfold-q5",
      question:
        "A metagenomics study discovers a novel protein family with no detectable homologs in existing databases. The researcher runs both AlphaFold2 and ESMFold on representative sequences. AlphaFold2 produces low-confidence predictions (low pLDDT, shallow MSAs), while ESMFold also produces low-confidence predictions (low pTM). What is the most appropriate interpretation?",
      options: [
        "Both tools are broken and should be updated to newer versions",
        "The protein must be intrinsically disordered since neither tool can predict it",
        "Both methods are limited by lack of evolutionary context: AlphaFold2 suffers from shallow MSAs, and ESMFold's language model has limited implicit knowledge of this novel family. Low confidence correctly signals high uncertainty, not necessarily that the protein lacks structure",
        "ESMFold's prediction should be trusted over AlphaFold2's because language models generalize better to novel proteins in every case",
      ],
      correctIndex: 2,
      explanation:
        "For truly novel protein families without detectable homologs, both methods face challenges. AlphaFold2 relies on MSAs that will be shallow or empty. ESMFold's language model, while powerful, was trained on existing sequence databases and may not have learned the patterns of this novel family. Low confidence from both tools reflects genuine uncertainty. The protein could still have a well-defined structure; it is simply outside the models' training distribution. Experimental structure determination may be the only path forward.",
      difficulty: "advanced",
    },
  ],

  // ─────────────────────────────────────────────
  // MODULE 5: EvoProtGrad
  // ─────────────────────────────────────────────
  evoprotgrad: [
    {
      id: "evoprotgrad-q1",
      question:
        "What is directed evolution in the context of protein engineering?",
      options: [
        "A computational method that predicts protein structures from genomic data",
        "An iterative process of introducing mutations and selecting variants with improved properties, mimicking natural evolution in the laboratory",
        "A technique for aligning DNA sequences across multiple species",
        "A method for extracting proteins from thermophilic organisms",
      ],
      correctIndex: 1,
      explanation:
        "Directed evolution involves repeated rounds of creating genetic diversity (through random mutation or recombination) and screening or selecting for variants with desired properties such as improved activity, stability, or specificity. It mimics natural evolution but focuses selection on properties of interest. Frances Arnold won the 2018 Nobel Prize in Chemistry for pioneering this approach.",
      difficulty: "beginner",
    },
    {
      id: "evoprotgrad-q2",
      question:
        "What is a major advantage of computational directed evolution methods like EvoProtGrad over traditional laboratory directed evolution?",
      options: [
        "Computational methods guarantee that every designed protein will work in the lab",
        "Computational methods can explore the mutational landscape much faster and more cheaply, reducing the number of costly experimental rounds",
        "Computational methods do not require any knowledge of the starting protein sequence",
        "Laboratory directed evolution has been completely replaced by computational methods",
      ],
      correctIndex: 1,
      explanation:
        "Laboratory directed evolution is powerful but slow and expensive: each round requires cloning, expression, and screening of thousands of variants. Computational methods like EvoProtGrad can rapidly explore vast mutational landscapes in silico, prioritizing the most promising mutations before any lab work begins. This dramatically reduces time and cost, though experimental validation of top candidates remains essential.",
      difficulty: "beginner",
    },
    {
      id: "evoprotgrad-q3",
      question:
        "How does EvoProtGrad's gradient-guided approach differ from random mutagenesis?",
      options: [
        "It only works on proteins shorter than 100 amino acids",
        "It uses gradients from a fitness model to propose mutations in directions predicted to improve the desired property, rather than mutating randomly",
        "It introduces more mutations per round than random methods",
        "It only changes residues on the surface of the protein",
      ],
      correctIndex: 1,
      explanation:
        "EvoProtGrad uses gradient information from a differentiable fitness model to guide mutations toward regions of sequence space predicted to improve the target property. Rather than blind random sampling, it computes which mutations at which positions are most likely to increase fitness, making the search far more efficient. This is analogous to how gradient descent efficiently navigates loss landscapes in machine learning.",
      difficulty: "intermediate",
    },
    {
      id: "evoprotgrad-q4",
      question:
        "In the concept of a protein fitness landscape, what do 'peaks' and 'valleys' represent?",
      options: [
        "Peaks are high-expression sequences and valleys are aggregation-prone sequences",
        "Peaks represent sequence variants with high fitness for the desired property, and valleys represent low-fitness variants, with the landscape mapping sequence space to function",
        "Peaks are alpha-helices and valleys are beta-sheets in the protein structure",
        "Peaks are conserved residues and valleys are variable residues across evolution",
      ],
      correctIndex: 1,
      explanation:
        "A fitness landscape is a conceptual mapping from sequence space to a fitness measure (such as enzyme activity or binding affinity). Peaks correspond to sequence variants that perform well, and valleys correspond to poor performers. The challenge of protein engineering is navigating this high-dimensional landscape to find peaks. Gradient-based methods like EvoProtGrad aim to climb efficiently toward peaks rather than wandering randomly.",
      difficulty: "intermediate",
    },
    {
      id: "evoprotgrad-q5",
      question:
        "A researcher uses EvoProtGrad to optimize an enzyme's catalytic activity. The model's gradient-guided search converges on a variant with a predicted 50-fold improvement. The researcher immediately moves to large-scale production without experimental testing of the variant. What is wrong with this approach?",
      options: [
        "EvoProtGrad can only optimize thermostability, not catalytic activity",
        "A 50-fold improvement is too small to be meaningful for any practical application",
        "Computational fitness predictions are approximations based on learned models that can be wrong, especially far from the training data. Predicted improvements must always be validated experimentally, as models may not account for aggregation, misfolding, loss of specificity, or other failure modes",
        "The researcher should have used random mutagenesis instead because gradient methods never work for enzymes",
      ],
      correctIndex: 2,
      explanation:
        "Computational predictions, no matter how sophisticated, are models of reality, not reality itself. Large predicted improvements can arise from the model extrapolating beyond its reliable range. The optimized variant might aggregate, misfold, lose specificity, or behave differently than predicted for countless reasons not captured by the fitness model. Experimental validation is a non-negotiable step in any protein engineering pipeline.",
      difficulty: "advanced",
    },
  ],

  // ─────────────────────────────────────────────
  // MODULE 6: RFAntibody
  // ─────────────────────────────────────────────
  rfantibody: [
    {
      id: "rfantibody-q1",
      question:
        "What are CDRs (Complementarity-Determining Regions) in an antibody?",
      options: [
        "The constant regions that determine which antibody class (IgG, IgM, etc.) the molecule belongs to",
        "The hypervariable loops that directly contact the antigen and determine binding specificity",
        "The disulfide bonds that hold the heavy and light chains together",
        "The signal peptides that direct antibody secretion from B cells",
      ],
      correctIndex: 1,
      explanation:
        "CDRs are the hypervariable loop regions of an antibody that make direct contact with the target antigen. There are six CDRs total: three on the heavy chain (CDR-H1, H2, H3) and three on the light chain (CDR-L1, L2, L3). Their sequences are highly diverse across antibodies, which is what allows the immune system to recognize an enormous variety of targets. The rest of the antibody structure (framework regions) is relatively conserved.",
      difficulty: "beginner",
    },
    {
      id: "rfantibody-q2",
      question:
        "Why is CDR-H3 considered the most important loop for antibody design?",
      options: [
        "It is the only CDR that is encoded by a single gene segment",
        "It has the greatest length and sequence diversity among all CDRs and typically makes the most critical contacts with the antigen",
        "It is the only CDR present on the heavy chain",
        "It is always exactly 12 amino acids long, making it easy to model",
      ],
      correctIndex: 1,
      explanation:
        "CDR-H3 is formed by the junction of the V, D, and J gene segments, a process that introduces enormous diversity through combinatorial joining and junctional additions. It varies widely in both length and sequence, giving it the most structural diversity of any CDR. Because it typically sits at the center of the antigen-binding site, CDR-H3 often makes the most important contacts with the target antigen.",
      difficulty: "beginner",
    },
    {
      id: "rfantibody-q3",
      question:
        "In antibody design, why must framework regions be largely conserved even when redesigning CDR loops?",
      options: [
        "Framework regions are patented and cannot be modified legally",
        "Framework regions provide the structural scaffold that positions the CDR loops correctly; disrupting them can misfold the entire variable domain and destroy binding",
        "Framework regions are invisible to the immune system and do not matter",
        "Framework regions are always identical across all antibodies",
      ],
      correctIndex: 1,
      explanation:
        "The framework regions form the beta-sheet scaffold of the VH and VL domains that precisely positions the CDR loops for antigen recognition. Mutations in framework regions can subtly alter CDR loop orientations or destabilize the immunoglobulin fold entirely, abolishing binding even if the CDRs themselves are well-designed. This is why antibody engineering typically focuses mutations on CDRs while keeping frameworks close to germline sequences.",
      difficulty: "intermediate",
    },
    {
      id: "rfantibody-q4",
      question:
        "What does 'developability' mean in the context of antibody design, and why does it matter?",
      options: [
        "It refers to how quickly the antibody gene can be cloned into an expression vector",
        "It encompasses properties like solubility, stability, low aggregation propensity, and manufacturability that determine whether an antibody can be developed into a viable therapeutic, beyond just binding affinity",
        "It measures how quickly the antibody evolves new specificities in response to antigen exposure",
        "It is a purely computational metric with no relevance to real-world antibody development",
      ],
      correctIndex: 1,
      explanation:
        "An antibody that binds its target tightly but aggregates in solution, has poor stability, or cannot be manufactured at scale will fail as a therapeutic. Developability encompasses the biophysical and manufacturing properties that make an antibody viable for clinical use: solubility, thermal stability, low self-association, absence of post-translational modification liabilities, and acceptable pharmacokinetics. Modern antibody design must consider developability alongside affinity.",
      difficulty: "intermediate",
    },
    {
      id: "rfantibody-q5",
      question:
        "A researcher uses RFAntibody to design CDR loops targeting a viral surface protein. The top design has excellent predicted binding metrics but contains an unpaired cysteine in CDR-H3, a deamidation-prone NG motif in CDR-L1, and an unusually long CDR-H3 of 28 residues. The researcher selects this design for therapeutic development. What concerns should be raised?",
      options: [
        "No concerns; the predicted binding metrics are all that matter for therapeutic antibodies",
        "The only concern is the long CDR-H3 because the immune system never produces loops that long",
        "All three features are serious developability red flags: the unpaired cysteine risks aberrant disulfide formation and aggregation, the NG motif risks deamidation leading to heterogeneity and loss of potency, and the long CDR-H3 may be structurally unstable and hard to manufacture. Binding alone does not make a viable therapeutic",
        "These features only matter for antibodies produced in mammalian cells, not in bacterial systems",
      ],
      correctIndex: 2,
      explanation:
        "Each of these features poses a distinct developability risk. Unpaired cysteines can form intermolecular disulfides causing aggregation. Asparagine-glycine (NG) motifs are hotspots for deamidation, a chemical modification that can alter binding and create product heterogeneity. Very long CDR-H3 loops are more conformationally flexible and may be harder to produce consistently. A successful therapeutic antibody must balance binding affinity with biophysical properties that enable manufacturing and clinical use.",
      difficulty: "advanced",
    },
  ],

  // ─────────────────────────────────────────────
  // MODULE 7: TEMStaPro
  // ─────────────────────────────────────────────
  temstapro: [
    {
      id: "temstapro-q1",
      question:
        "What does the melting temperature (Tm) of a protein indicate?",
      options: [
        "The temperature at which the protein is synthesized by ribosomes",
        "The temperature at which half the protein population is unfolded, serving as a measure of thermal stability",
        "The optimal temperature at which the protein has maximum catalytic activity",
        "The temperature at which water molecules inside the protein crystallize",
      ],
      correctIndex: 1,
      explanation:
        "The melting temperature (Tm) is the temperature at which 50% of a protein population has transitioned from the folded to the unfolded state. A higher Tm indicates greater thermal stability. It is a widely used metric in protein engineering because more thermostable proteins tend to be more robust for industrial and therapeutic applications. Note that Tm is distinct from the optimal activity temperature.",
      difficulty: "beginner",
    },
    {
      id: "temstapro-q2",
      question:
        "What is the difference between thermophilic and mesophilic organisms in relation to their proteins?",
      options: [
        "Thermophilic organisms only produce membrane proteins while mesophilic organisms produce soluble proteins",
        "Thermophilic organisms thrive at high temperatures and their proteins are adapted to be stable at elevated temperatures, while mesophilic organisms live at moderate temperatures with correspondingly less thermostable proteins",
        "There is no difference; all proteins have the same stability regardless of the organism",
        "Mesophilic organisms produce proteins with higher melting temperatures than thermophilic organisms",
      ],
      correctIndex: 1,
      explanation:
        "Thermophilic organisms (like those found in hot springs) have evolved proteins with enhanced thermal stability to function at elevated temperatures, often above 60-80 degrees Celsius. Mesophilic organisms live at moderate temperatures (20-45 degrees Celsius) and their proteins are optimized for that range. Studying the sequence and structural differences between thermophilic and mesophilic variants of the same protein has been key to understanding the molecular basis of thermostability.",
      difficulty: "beginner",
    },
    {
      id: "temstapro-q3",
      question:
        "TEMStaPro predicts thermostability using protein language model embeddings. Why is thermostability often considered a useful proxy for overall protein quality in design?",
      options: [
        "Because thermostable proteins are always more enzymatically active than unstable ones",
        "Because higher thermostability often correlates with better expression, longer shelf life, and greater tolerance to mutations, making it a practical indicator of general robustness",
        "Because protein language models can only measure temperature-related properties",
        "Because regulatory agencies require all therapeutic proteins to be thermostable",
      ],
      correctIndex: 1,
      explanation:
        "While thermostability is not directly equivalent to function, it correlates with many practically useful properties. More stable proteins tend to express better, resist proteolysis, tolerate a wider range of conditions, have longer shelf lives, and better accommodate functional mutations without unfolding. This makes Tm prediction a valuable screening metric in protein engineering pipelines, even when stability itself is not the primary goal.",
      difficulty: "intermediate",
    },
    {
      id: "temstapro-q4",
      question:
        "TEMStaPro's predictions have an uncertainty of approximately plus or minus 5 degrees Celsius. Why is this important to keep in mind when using the tool?",
      options: [
        "It is not important; 5 degrees is negligible in all contexts",
        "It means a predicted Tm of 65 degrees Celsius could realistically be anywhere from roughly 60 to 70 degrees, so small predicted differences between variants should not be over-interpreted and rankings of closely-scored candidates may not be reliable",
        "It means the tool only works for proteins with Tm above 50 degrees Celsius",
        "It indicates the tool should only be used for thermophilic proteins",
      ],
      correctIndex: 1,
      explanation:
        "A plus or minus 5 degree Celsius uncertainty means that if two variants have predicted Tm values of 63 and 66 degrees Celsius, the difference is well within the noise of the prediction and you cannot confidently claim one is more stable. This uncertainty should guide how you use the tool: it is more reliable for distinguishing large differences (e.g., 50 vs 75 degrees) than for fine-grained ranking of similar candidates. Experimental validation is needed for close calls.",
      difficulty: "intermediate",
    },
    {
      id: "temstapro-q5",
      question:
        "A researcher uses TEMStaPro to optimize an enzyme for an industrial process. They find a variant with a predicted Tm increase of 20 degrees Celsius over the wild type. However, upon experimental testing, the variant expresses well but has lost 95% of its catalytic activity. What principle does this illustrate?",
      options: [
        "TEMStaPro predictions are always incorrect for industrial enzymes",
        "A 20 degree Celsius Tm increase is impossible to achieve through protein engineering",
        "Stability and function can be at odds: mutations that rigidify a protein for thermostability can simultaneously restrict the conformational flexibility needed for catalysis. Optimizing one property in isolation can compromise another, so stability engineering must be balanced against functional requirements",
        "The enzyme was already too stable before engineering and did not need further optimization",
      ],
      correctIndex: 2,
      explanation:
        "This is a classic stability-function trade-off. Many enzymes require conformational flexibility for catalysis: loop motions for substrate binding, domain movements for the catalytic cycle, or breathing motions for product release. Mutations that dramatically increase rigidity and stability can freeze out these essential dynamics. Effective protein engineering requires multi-objective optimization that balances stability with function, not maximizing either in isolation.",
      difficulty: "advanced",
    },
  ],

  // ─────────────────────────────────────────────
  // MODULE 8: GeoDock
  // ─────────────────────────────────────────────
  geodock: [
    {
      id: "geodock-q1",
      question:
        "What does protein-protein docking aim to predict?",
      options: [
        "The amino acid sequence of a protein that binds to a given target",
        "The three-dimensional arrangement of two or more proteins when they form a complex, including their relative positions and orientations",
        "The rate at which two proteins associate in solution",
        "The evolutionary relationship between two protein families",
      ],
      correctIndex: 1,
      explanation:
        "Protein-protein docking predicts how two protein structures come together to form a complex. It determines the relative position and orientation of the binding partners and identifies which surfaces make contact. This is critical for understanding biological interactions, designing protein interfaces, and developing drugs that disrupt or stabilize protein complexes.",
      difficulty: "beginner",
    },
    {
      id: "geodock-q2",
      question:
        "Why is protein-protein docking computationally challenging even when the individual structures are known?",
      options: [
        "Because protein structures are too small to analyze computationally",
        "Because the search space has six degrees of freedom (three translational and three rotational), creating an enormous number of possible arrangements to evaluate",
        "Because proteins always change their sequences when they interact",
        "Because docking only works with proteins from the same organism",
      ],
      correctIndex: 1,
      explanation:
        "Even treating proteins as rigid bodies, one protein can be positioned at any point relative to the other (3 translational degrees of freedom) and in any orientation (3 rotational degrees of freedom). This six-dimensional search space is vast, and each possible arrangement must be scored for physical plausibility. Adding side-chain flexibility or backbone conformational changes multiplies the complexity enormously.",
      difficulty: "beginner",
    },
    {
      id: "geodock-q3",
      question:
        "What is the difference between rigid-body docking and flexible docking?",
      options: [
        "Rigid-body docking only works with crystal structures while flexible docking works with any input",
        "Rigid-body docking keeps protein structures fixed and explores only their relative positioning, while flexible docking also allows conformational changes in the proteins during the docking process",
        "Rigid-body docking is always more accurate than flexible docking",
        "Flexible docking means the proteins are modeled as unfolded chains that fold upon binding",
      ],
      correctIndex: 1,
      explanation:
        "Rigid-body docking treats each protein as an unchanging solid shape and searches for the best way to fit them together. This is computationally efficient but ignores the reality that proteins often change conformation upon binding. Flexible docking accounts for some degree of structural adaptation, such as side-chain rearrangements or loop movements, better capturing the phenomenon of 'induced fit' at higher computational cost.",
      difficulty: "intermediate",
    },
    {
      id: "geodock-q4",
      question:
        "GeoDock uses SE(3)-equivariant geometric deep learning. Why is this mathematical property valuable for a docking method?",
      options: [
        "It allows the model to work without knowing the amino acid sequences of the input proteins",
        "It ensures that the predicted complex and its scores are consistent regardless of how the input proteins are positioned or oriented in space, which is physically correct since binding does not depend on coordinate frame",
        "It restricts the model to only predict symmetric homodimer complexes",
        "It makes the model run on quantum computers instead of classical hardware",
      ],
      correctIndex: 1,
      explanation:
        "SE(3) equivariance means the model's predictions transform correctly under rotations and translations. If you rotate both input proteins by the same amount, the predicted complex rotates identically. This respects fundamental physics: protein binding is determined by molecular interactions, not by arbitrary coordinate system choices. Without this property, a model might give different predictions for physically identical setups described in different coordinate frames.",
      difficulty: "intermediate",
    },
    {
      id: "geodock-q5",
      question:
        "A researcher uses GeoDock to dock a designed antibody against a viral spike protein. The top-scoring pose shows an extensive interface with excellent predicted scores. However, the antibody is oriented with its framework region contacting the antigen rather than its CDR loops. The second-ranked pose, with a slightly lower score, shows a CDR-mediated contact mode. The researcher selects the top-scoring pose for experimental testing. What critical mistake is being made?",
      options: [
        "GeoDock cannot dock antibodies, so any result is meaningless",
        "The researcher should have averaged all poses into a single consensus structure",
        "Scoring functions are imperfect and biological knowledge must inform pose selection. Antibodies bind through their CDR loops, so a framework-mediated pose is biologically implausible regardless of its score. Always examine multiple top poses and apply domain expertise, rather than blindly trusting the top-ranked prediction",
        "The second pose is also incorrect because antibodies never bind to viral proteins",
      ],
      correctIndex: 2,
      explanation:
        "Docking scoring functions are approximations that can rank biologically implausible poses highly. Antibodies are known to bind antigens through their CDR loops, not their framework regions. A framework-mediated pose, no matter how well-scored, contradicts fundamental antibody biology. This illustrates why researchers must always examine multiple top-ranked poses, apply domain knowledge to filter implausible solutions, and never treat the top-scoring pose as automatically correct.",
      difficulty: "advanced",
    },
  ],
};

export function getQuizForModule(moduleId: string): QuizQuestion[] | undefined {
  return MODULE_QUIZZES[moduleId];
}
