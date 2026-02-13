/* ── Evidence panel content per workspace step ────────────────── */

export interface EvidenceLink {
  text: string;
  url: string;
}

export interface EvidenceItem {
  title: string;
  content: string;
  type: "info" | "metric" | "citation" | "warning" | "structure" | "literature";
  /** Optional subtitle shown after title (e.g., residue range) */
  subtitle?: string;
  /** Optional metric highlight (e.g., "68% — Moderate confidence") */
  highlight?: string;
  highlightColor?: "green" | "amber" | "red" | "purple";
  /** Optional link */
  link?: EvidenceLink;
}

export interface EvidenceSection {
  heading: string;
  items: EvidenceItem[];
}

export interface StepEvidence {
  heading: string;
  description?: string;
  sections: EvidenceSection[];
}

export const WORKSPACE_EVIDENCE: Record<string, StepEvidence> = {
  pdb: {
    heading: "Target Selection",
    description: "Enter a target antigen to see structural evidence and analysis.",
    sections: [
      {
        heading: "Best Practices",
        items: [
          {
            title: "Resolution Guidelines",
            content:
              "Choose structures with resolution < 3.0 \u00c5 for optimal results. Higher resolution enables more accurate hotspot identification and backbone generation.",
            type: "info",
          },
          {
            title: "Structure Completeness",
            content:
              "Ensure the PDB covers the region of interest. Missing loops or disordered regions may need to be modeled before design.",
            type: "warning",
          },
        ],
      },
      {
        heading: "Recommended Targets",
        items: [
          {
            title: "6M0J",
            subtitle: "2.45 \u00c5 resolution",
            content:
              "SARS-CoV-2 RBD bound to human ACE2. Well-characterized interface with extensive neutralizing antibody data. Ideal for guided design.",
            type: "structure",
            link: { text: "View on RCSB", url: "https://www.rcsb.org/structure/6M0J" },
          },
          {
            title: "7DK2",
            subtitle: "2.55 \u00c5 resolution",
            content:
              "Antibody-RBD complex showing class 1 binding mode. Useful reference for CDR-H3 loop geometry.",
            type: "structure",
            link: { text: "View on RCSB", url: "https://www.rcsb.org/structure/7DK2" },
          },
        ],
      },
      {
        heading: "Key Literature",
        items: [
          {
            title: "Lan J, Ge J, Yu J, et al. (2020)",
            content:
              "Structure of the SARS-CoV-2 spike receptor-binding domain bound to the ACE2 receptor.",
            type: "literature",
            link: { text: "Nature", url: "https://doi.org/10.1038/s41586-020-2180-5" },
          },
        ],
      },
    ],
  },

  framework: {
    heading: "Framework Analysis",
    description: "Comparative analysis of antibody scaffold architectures.",
    sections: [
      {
        heading: "Framework Comparison",
        items: [
          {
            title: "IgG1 — Full Effector Function",
            content:
              "Most commonly used therapeutic framework. Strong ADCC/CDC activity, ~21-day serum half-life. Preferred for neutralizing antibodies against viral targets.",
            type: "info",
            highlight: "Recommended for viral targets",
            highlightColor: "green",
          },
          {
            title: "IgG4 — Reduced Effector Function",
            content:
              "Minimizes Fc-mediated immune activation. Fab-arm exchange in vivo can create bispecific molecules. Used in checkpoint inhibitors (pembrolizumab, nivolumab).",
            type: "info",
          },
          {
            title: "VHH — Nanobody",
            content:
              "Single-domain antibody (~15 kDa vs ~150 kDa). Accesses cryptic epitopes in receptor binding cleft. High thermostability (Tm up to 80\u00b0C). Easy microbial production.",
            type: "info",
          },
        ],
      },
      {
        heading: "Thermal Stability",
        items: [
          {
            title: "Melting Temperatures",
            content:
              "IgG1 CH2: ~70\u00b0C | IgG4 CH2: ~67\u00b0C | VHH: 65-80\u00b0C (highly variable). VHH can be thermostable due to single-domain architecture and additional disulfide bonds.",
            type: "metric",
            highlight: "IgG1: 70\u00b0C | IgG4: 67\u00b0C | VHH: 65-80\u00b0C",
            highlightColor: "purple",
          },
        ],
      },
      {
        heading: "Key Literature",
        items: [
          {
            title: "Vidarsson G, Dekkers G, Rispens T. (2014)",
            content:
              "IgG subclasses and allotypes: from structure to effector functions.",
            type: "literature",
            link: { text: "Front Immunol", url: "https://doi.org/10.3389/fimmu.2014.00520" },
          },
          {
            title: "Muyldermans S. (2013)",
            content:
              "Nanobodies: natural single-domain antibodies.",
            type: "literature",
            link: { text: "Annu Rev Biochem", url: "https://doi.org/10.1146/annurev-biochem-063011-092449" },
          },
        ],
      },
    ],
  },

  hotspots: {
    heading: "Structural Evidence",
    description: "Structural evidence for recommended binding hotspots.",
    sections: [
      {
        heading: "Binding Analysis",
        items: [
          {
            title: "ACE2–RBD Interface",
            content:
              "The RBD-ACE2 binding interface buries ~1,700 \u00c5\u00b2 of surface area. Key contact residues include K417, Y453, L455, F456, Y489, Q493, G496, Q498, T500, and N501.",
            type: "metric",
            highlight: "KD ~15 nM — High affinity interface",
            highlightColor: "green",
          },
          {
            title: "Epitope Accessibility",
            content:
              "The RBM (438-508) has the highest solvent accessibility in the \"up\" conformation. In the \"down\" state, the RBM is partially occluded by neighboring RBDs in the trimer.",
            type: "info",
            highlight: "68% — Moderate surface accessibility",
            highlightColor: "amber",
          },
        ],
      },
      {
        heading: "Considered Regions",
        items: [
          {
            title: "CR3022 Cryptic Epitope",
            subtitle: "E:369-386",
            content:
              "Conserved cryptic epitope accessible only when RBD is in the \"up\" conformation. Targeted by cross-reactive antibodies CR3022 and S309. High conservation across sarbecoviruses.",
            type: "info",
          },
          {
            title: "SD1 Subdomain",
            subtitle: "Near RBD-S2 junction",
            content:
              "Low solvent accessibility in the prefusion trimer. Partially buried at the inter-protomer interface with limited antibody access. Few known neutralizing antibodies target this region.",
            type: "warning",
          },
          {
            title: "S2 Fusion Peptide",
            subtitle: "Fusion machinery",
            content:
              "Cryptic epitope only exposed during conformational change. Not accessible in the prefusion structure used for design, making it unsuitable for structure-based antibody design.",
            type: "warning",
          },
        ],
      },
      {
        heading: "Related Complexes",
        items: [
          {
            title: "7BNN",
            subtitle: "SARS-CoV-2 RBD in complex with S309 Fab",
            content:
              "Shows a conserved RBD epitope outside the RBM that enables cross-variant neutralization. S309 is the parent of sotrovimab.",
            type: "structure",
            link: { text: "View on RCSB", url: "https://www.rcsb.org/structure/7BNN" },
          },
          {
            title: "7C01",
            subtitle: "SARS-CoV-2 RBD in complex with CB6 Fab",
            content:
              "Class 1 antibody binding mode — CDR-H3 inserts into the ACE2 binding groove. Demonstrates competitive inhibition of ACE2.",
            type: "structure",
            link: { text: "View on RCSB", url: "https://www.rcsb.org/structure/7C01" },
          },
          {
            title: "6XDG",
            subtitle: "REGN-COV2 cocktail bound to RBD",
            content:
              "Two non-competing antibodies (REGN10933 + REGN10987) targeting distinct RBD epitopes. Demonstrates cocktail strategy for variant resistance.",
            type: "structure",
            link: { text: "View on RCSB", url: "https://www.rcsb.org/structure/6XDG" },
          },
        ],
      },
      {
        heading: "Literature",
        items: [
          {
            title: "Barnes CO, Jette CA, Abernathy ME, et al. (2020)",
            content:
              "SARS-CoV-2 neutralizing antibody structures inform therapeutic strategies.",
            type: "literature",
            link: { text: "Nature", url: "https://doi.org/10.1038/s41586-020-2852-1" },
          },
          {
            title: "McCallum M, De Marco A, Lempp FA, et al. (2021)",
            content:
              "N-terminal domain antigenic mapping reveals a site of vulnerability for SARS-CoV-2.",
            type: "literature",
            link: { text: "Cell", url: "https://doi.org/10.1016/j.cell.2021.01.024" },
          },
          {
            title: "Piccoli L, Park YJ, Tortorici MA, et al. (2020)",
            content:
              "Mapping neutralizing and immunodominant sites on the SARS-CoV-2 spike receptor-binding domain.",
            type: "literature",
            link: { text: "Cell", url: "https://doi.org/10.1016/j.cell.2020.09.037" },
          },
          {
            title: "Pinto D, Park YJ, Beltramello M, et al. (2020)",
            content:
              "Cross-neutralization of SARS-CoV-2 by a human monoclonal SARS-CoV antibody.",
            type: "literature",
            link: { text: "Nature", url: "https://doi.org/10.1038/s41586-020-2349-y" },
          },
        ],
      },
    ],
  },

  config: {
    heading: "Design Parameters",
    description: "Guidance for configuring the antibody generation parameters.",
    sections: [
      {
        heading: "Parameter Guidance",
        items: [
          {
            title: "Candidate Count",
            content:
              "More candidates increase the chance of finding high-affinity binders but require more compute. 200 is a good starting point; 500+ recommended for difficult or cryptic epitopes.",
            type: "info",
          },
          {
            title: "CDR Loop Length",
            content:
              "Standard CDR-H3 (10-15 residues) covers most natural antibodies. Extended CDR-H3 (16-24 residues) enables reaching recessed epitopes common in viral receptor binding sites.",
            type: "info",
          },
        ],
      },
      {
        heading: "Expected Outcomes",
        items: [
          {
            title: "Success Rate",
            content:
              "With RBD targeting and IgG1 framework, expect ~15-25% of candidates to show predicted binding affinity < 100 nM based on composite scoring.",
            type: "metric",
            highlight: "15-25% expected hit rate",
            highlightColor: "green",
          },
          {
            title: "Diversity vs Convergence",
            content:
              "Higher candidate counts generally yield more diverse solutions. For 200 candidates, expect 5-10 distinct structural clusters. For 500+, expect 15-30 clusters.",
            type: "metric",
          },
        ],
      },
      {
        heading: "Key Literature",
        items: [
          {
            title: "Watson JL, Juergens D, Bennett NR, et al. (2023)",
            content:
              "De novo design of protein structure and function with RFdiffusion.",
            type: "literature",
            link: { text: "Nature", url: "https://doi.org/10.1038/s41586-023-06415-8" },
          },
          {
            title: "Dauparas J, Anishchenko I, Bennett N, et al. (2022)",
            content:
              "Robust deep learning–based protein sequence design using ProteinMPNN.",
            type: "literature",
            link: { text: "Science", url: "https://doi.org/10.1126/science.add2187" },
          },
        ],
      },
    ],
  },

  pipeline: {
    heading: "Module Benchmarks",
    description: "Performance metrics for each computational module in the pipeline.",
    sections: [
      {
        heading: "Pipeline Modules",
        items: [
          {
            title: "RFdiffusion-Antibody",
            content:
              "Generates diverse antibody backbone structures conditioned on target epitope geometry using denoising diffusion.",
            type: "metric",
            highlight: "~75% designability rate",
            highlightColor: "green",
          },
          {
            title: "ProteinMPNN",
            content:
              "Inverse folding model that designs optimal amino acid sequences for generated backbones using message-passing neural networks.",
            type: "metric",
            highlight: "~95% sequence recovery",
            highlightColor: "green",
          },
          {
            title: "ESMFold",
            content:
              "Fast single-sequence structure prediction for validating that designed sequences fold into the intended backbone conformation.",
            type: "metric",
            highlight: "~91% accuracy (pLDDT > 70)",
            highlightColor: "green",
          },
          {
            title: "Composite Scoring",
            content:
              "Combines predicted binding affinity (interface energy), structural quality (pTM, pLDDT), and sequence naturalness into a single ranking score.",
            type: "info",
          },
        ],
      },
      {
        heading: "Compute Estimates",
        items: [
          {
            title: "GPU Runtime",
            content:
              "200 candidates: ~2-4 hours | 500 candidates: ~5-8 hours | 1000 candidates: ~10-16 hours. Scales roughly linearly with candidate count. Requires NVIDIA A100 or equivalent.",
            type: "metric",
            highlight: "GPU Required — A100 recommended",
            highlightColor: "purple",
          },
        ],
      },
      {
        heading: "Key Literature",
        items: [
          {
            title: "Watson JL, Juergens D, Bennett NR, et al. (2023)",
            content:
              "De novo design of protein structure and function with RFdiffusion.",
            type: "literature",
            link: { text: "Nature", url: "https://doi.org/10.1038/s41586-023-06415-8" },
          },
          {
            title: "Dauparas J, Anishchenko I, Bennett N, et al. (2022)",
            content:
              "Robust deep learning–based protein sequence design using ProteinMPNN.",
            type: "literature",
            link: { text: "Science", url: "https://doi.org/10.1126/science.add2187" },
          },
          {
            title: "Lin Z, Akin H, Rao R, et al. (2023)",
            content:
              "Evolutionary-scale prediction of atomic-level protein structure with a language model.",
            type: "literature",
            link: { text: "Science", url: "https://doi.org/10.1126/science.ade2574" },
          },
        ],
      },
    ],
  },

  results: {
    heading: "Results",
    description: "Your experiment is running. Results will appear as pipeline stages complete.",
    sections: [
      {
        heading: "What to Expect",
        items: [
          {
            title: "Pipeline Progress",
            content:
              "Each module runs sequentially: backbone generation → sequence design → structure validation → scoring. Progress updates appear in real time.",
            type: "info",
          },
          {
            title: "Interpreting Scores",
            content:
              "Composite scores range from 0-1. Candidates scoring > 0.7 are strong hits. Look for structural convergence across top candidates as a signal of design confidence.",
            type: "info",
          },
        ],
      },
      {
        heading: "Next Steps",
        items: [
          {
            title: "Experimental Validation",
            content:
              "Top candidates should be experimentally validated via SPR binding assays, thermal shift assays, and pseudovirus neutralization. Typically select 10-20 candidates for synthesis.",
            type: "info",
          },
        ],
      },
    ],
  },
};
