import { MODULE_CATALOG, type ModuleMetadata } from "@/data/modules-catalog";

export function getCompatibleModules(
  moduleId: string,
  direction: "upstream" | "downstream"
): ModuleMetadata[] {
  const target = MODULE_CATALOG.find((m) => m.id === moduleId);
  if (!target) return [];

  if (direction === "upstream") {
    return MODULE_CATALOG.filter(
      (m) =>
        m.id !== moduleId &&
        m.outputFormats.some((fmt) => target.inputFormats.includes(fmt))
    );
  } else {
    return MODULE_CATALOG.filter(
      (m) =>
        m.id !== moduleId &&
        m.inputFormats.some((fmt) => target.outputFormats.includes(fmt))
    );
  }
}

export function validateModuleConnection(
  fromId: string,
  toId: string
): { valid: boolean; message: string; learningNote: string } {
  const from = MODULE_CATALOG.find((m) => m.id === fromId);
  const to = MODULE_CATALOG.find((m) => m.id === toId);

  if (!from || !to) {
    return {
      valid: false,
      message: "Module not found",
      learningNote: "",
    };
  }

  const compatibleFormats = from.outputFormats.filter((fmt) =>
    to.inputFormats.includes(fmt)
  );

  if (compatibleFormats.length > 0) {
    const formatStr = compatibleFormats.join(", ");

    const annotations: Record<string, Record<string, string>> = {
      rfdiffusion: {
        proteinmpnn: `${from.displayName} generates 3D backbone structures (PDB) → ${to.displayName} takes these structures and designs amino acid sequences that will fold into them (FASTA). This is the classic generate-then-design pipeline.`,
      },
      proteinmpnn: {
        alphafold2: `${from.displayName} outputs designed sequences (FASTA) → ${to.displayName} predicts whether those sequences actually fold into the intended structure. This is the validation step — checking if your design works.`,
        esmfold: `${from.displayName} outputs designed sequences (FASTA) → ${to.displayName} quickly predicts structures for the designed sequences. Use this for rapid screening before committing to the more accurate AlphaFold2.`,
        evoprotgrad: `${from.displayName} outputs designed sequences (FASTA) → ${to.displayName} optimizes them further through directed evolution. This can improve properties like stability and binding affinity.`,
        temstapro: `${from.displayName} outputs designed sequences (FASTA) → ${to.displayName} checks if those sequences produce thermostable proteins. Catching instability early saves expensive wet lab failures.`,
      },
      alphafold2: {
        rfdiffusion: `${from.displayName} provides validated structures (PDB) → ${to.displayName} can use these as templates for generating novel variants. Useful for scaffold-based design.`,
        proteinmpnn: `${from.displayName} predicts structure (PDB) → ${to.displayName} redesigns sequences for that structure. Useful for redesigning natural proteins.`,
        geodock: `${from.displayName} predicts protein structure (PDB) → ${to.displayName} predicts how the protein interacts with binding partners. Essential for understanding protein function in context.`,
        rfantibody: `${from.displayName} provides target structure (PDB) → ${to.displayName} designs antibodies against that target. The structural detail guides CDR design for optimal binding.`,
      },
      esmfold: {
        proteinmpnn: `${from.displayName} predicts structure (PDB) → ${to.displayName} redesigns sequences. A fast predict-then-redesign loop.`,
        geodock: `${from.displayName} predicts protein structure (PDB) → ${to.displayName} docks it against binding partners.`,
        rfantibody: `${from.displayName} provides quick target structure prediction (PDB) → ${to.displayName} designs antibodies against the predicted target.`,
      },
      evoprotgrad: {
        alphafold2: `${from.displayName} outputs optimized sequences (FASTA) → ${to.displayName} validates that the optimized sequences still fold correctly. Mutations that improve one property can destabilize the fold.`,
        esmfold: `${from.displayName} outputs optimized sequences (FASTA) → ${to.displayName} quickly checks that optimized sequences maintain their structure.`,
        temstapro: `${from.displayName} outputs optimized sequences (FASTA) → ${to.displayName} checks their thermostability. Directed evolution can inadvertently reduce stability.`,
      },
      rfantibody: {
        temstapro: `${from.displayName} outputs designed antibody sequences (FASTA) → ${to.displayName} assesses their thermostability. Designed antibodies need to be stable for therapeutic use.`,
        geodock: `${from.displayName} outputs designed antibody structures (PDB) → ${to.displayName} validates binding to the target through docking. Confirms the designed antibody interacts as intended.`,
      },
    };

    const specificNote = annotations[fromId]?.[toId];
    const genericNote = `${from.displayName} outputs ${formatStr} format, which ${to.displayName} accepts as input. Data flows naturally between these modules.`;

    return {
      valid: true,
      message: `Compatible via ${formatStr}`,
      learningNote: specificNote || genericNote,
    };
  }

  const learningExplanations: Record<string, Record<string, string>> = {
    rfdiffusion: {
      alphafold2: `${from.displayName} outputs PDB structures, but ${to.displayName} expects FASTA sequences as input. You need a structure-to-sequence step (like ProteinMPNN) in between to design sequences for the generated backbone.`,
      esmfold: `${from.displayName} outputs PDB structures, but ${to.displayName} expects FASTA sequences. Insert ProteinMPNN between them to design sequences for the generated backbones.`,
      temstapro: `${from.displayName} outputs PDB structures, but ${to.displayName} expects FASTA sequences. You need ProteinMPNN first to generate sequences, then TemStaPro can assess their stability.`,
      evoprotgrad: `${from.displayName} outputs PDB structures, but ${to.displayName} expects FASTA sequences. Use ProteinMPNN to generate sequences from the backbone first.`,
    },
    geodock: {
      proteinmpnn: `${from.displayName} outputs docked complex structures and scores, but ${to.displayName} expects single-chain PDB structures for sequence design. You'd need to extract individual chains from the complex first.`,
    },
  };

  const specificExplanation = learningExplanations[fromId]?.[toId];
  const genericExplanation = `${from.displayName} outputs ${from.outputFormats.join("/")} format, but ${to.displayName} expects ${to.inputFormats.join("/")} input. These formats are incompatible — you need an intermediate conversion step.`;

  return {
    valid: false,
    message: `Incompatible: ${from.displayName} outputs ${from.outputFormats.join("/")} but ${to.displayName} needs ${to.inputFormats.join("/")}`,
    learningNote: specificExplanation || genericExplanation,
  };
}

export function suggestModulesForGoal(goal: string): string[] {
  const lower = goal.toLowerCase();
  const suggestions: string[] = [];

  if (lower.includes("antibody") || lower.includes("immunoglobulin") || lower.includes("cdr")) {
    suggestions.push("rfantibody", "temstapro", "geodock");
  }
  if (lower.includes("de novo") || lower.includes("novel protein") || lower.includes("new protein") || lower.includes("design")) {
    suggestions.push("rfdiffusion", "proteinmpnn", "alphafold2");
  }
  if (lower.includes("structure prediction") || lower.includes("fold") || lower.includes("predict structure")) {
    suggestions.push("alphafold2", "esmfold");
  }
  if (lower.includes("stability") || lower.includes("thermostab") || lower.includes("stable")) {
    suggestions.push("temstapro");
  }
  if (lower.includes("evolution") || lower.includes("optimize") || lower.includes("improve") || lower.includes("mutant")) {
    suggestions.push("evoprotgrad", "temstapro");
  }
  if (lower.includes("dock") || lower.includes("binding") || lower.includes("interaction") || lower.includes("complex")) {
    suggestions.push("geodock");
  }
  if (lower.includes("sequence design") || lower.includes("inverse fold")) {
    suggestions.push("proteinmpnn");
  }
  if (lower.includes("fast") || lower.includes("quick") || lower.includes("screen")) {
    suggestions.push("esmfold");
  }

  // Deduplicate while preserving order
  return Array.from(new Set(suggestions));
}
