/**
 * Parse PDB file content and extract unique chain IDs from ATOM/HETATM records.
 * Chain ID is at column 22 (1-indexed), i.e. index 21 (0-indexed).
 */
export function parsePdbChains(pdbText: string): string[] {
  const chains = new Set<string>();

  for (const line of pdbText.split("\n")) {
    if (line.startsWith("ATOM") || line.startsWith("HETATM")) {
      const chainId = line[21];
      if (chainId && chainId.trim()) {
        chains.add(chainId);
      }
    }
  }

  return Array.from(chains).sort();
}
