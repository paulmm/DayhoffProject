/**
 * Maps each workflow ID to a demo PDB ID from RCSB for the 3D viewer sidebar.
 */
export const WORKFLOW_DEMO_PDBS: Record<string, string> = {
  "de-novo-design": "7MRX",       // RFdiffusion-designed binder
  "antibody-optimization": "7DK2", // Antibody-antigen complex
  "structure-prediction": "1CRN",  // Crambin (classic prediction target)
  "directed-evolution": "1UBQ",    // Ubiquitin (well-studied evolution target)
  "molecular-docking": "3HFM",     // Protein-protein complex
  "antibody-workspace": "6M0J",   // SARS-CoV-2 RBD–ACE2 complex (guided workspace)
};

export function getDemoPdbId(workflowId: string): string | null {
  return WORKFLOW_DEMO_PDBS[workflowId] ?? null;
}
