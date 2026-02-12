/**
 * Maps each recipe ID to a demo PDB ID from RCSB for the 3D viewer sidebar.
 */
export const RECIPE_DEMO_PDBS: Record<string, string> = {
  "de-novo-design": "7MRX",       // RFdiffusion-designed binder
  "antibody-optimization": "7DK2", // Antibody-antigen complex
  "structure-prediction": "1CRN",  // Crambin (classic prediction target)
  "directed-evolution": "1UBQ",    // Ubiquitin (well-studied evolution target)
  "molecular-docking": "3HFM",     // Protein-protein complex
};

export function getDemoPdbId(recipeId: string): string | null {
  return RECIPE_DEMO_PDBS[recipeId] ?? null;
}
