export interface HotspotRegionData {
  id: string;
  name: string;
  chain: string;
  range: string;
  color: string;
  description: string;
}

export const SPIKE_HOTSPOT_REGIONS: HotspotRegionData[] = [
  {
    id: "rbm",
    name: "Receptor Binding Motif (RBM)",
    chain: "E",
    range: "438-508",
    color: "#ef4444",
    description:
      "Core ACE2 contact surface — the primary interaction interface with the highest density of binding residues (K417, Y453, L455, F456, Q493, N501).",
  },
  {
    id: "rbd-core",
    name: "RBD Core",
    chain: "E",
    range: "333-437",
    color: "#f59e0b",
    description:
      "Structural scaffold supporting the RBM — contains conserved disulfide bonds and beta-sheet framework. Targeted by class 3/4 neutralizing antibodies.",
  },
  {
    id: "ace2-interface",
    name: "ACE2 Interface Helix",
    chain: "A",
    range: "19-83",
    color: "#eab308",
    description:
      "ACE2 N-terminal helix that contacts the RBD — key residues include Q24, D30, K31, H34, E35, D38, Y41, Q42. Useful for competition-based design.",
  },
];
