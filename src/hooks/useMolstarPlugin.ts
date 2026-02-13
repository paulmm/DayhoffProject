import { useEffect, useRef, useState, type RefObject } from "react";
import { PluginContext } from "molstar/lib/mol-plugin/context";
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec";
import { Download, RawData, ParseCif } from "molstar/lib/mol-plugin-state/transforms/data";
import {
  TrajectoryFromMmCif,
  TrajectoryFromPDB,
  ModelFromTrajectory,
  StructureFromModel,
  StructureComponent,
} from "molstar/lib/mol-plugin-state/transforms/model";
import { StructureRepresentation3D } from "molstar/lib/mol-plugin-state/transforms/representation";
import { Color } from "molstar/lib/mol-util/color";
import { ColorNames } from "molstar/lib/mol-util/color/names";
import { MolScriptBuilder as MS } from "molstar/lib/mol-script/language/builder";
import { Expression } from "molstar/lib/mol-script/language/expression";
import { StructureElement, StructureProperties } from "molstar/lib/mol-model/structure";
import { Loci } from "molstar/lib/mol-model/loci";
import { OrderedSet } from "molstar/lib/mol-data/int/ordered-set";

export interface HighlightRegion {
  chain: string;
  startResidue: number;
  endResidue: number;
  color: string; // hex color e.g. "#ef4444"
  label?: string;
}

interface UseMolstarPluginOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  pdbId?: string;
  pdbData?: string;
  highlightedChain?: string;
  highlightRegions?: HighlightRegion[];
}

/** Build an Expression that selects atoms belonging to (or not belonging to) the given chain IDs */
function chainExpression(chainIds: string[], include: boolean): Expression {
  let test: Expression;

  if (chainIds.length === 1) {
    test = MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.auth_asym_id(),
      chainIds[0],
    ]);
  } else {
    test = MS.core.logic.or(
      chainIds.map((c) =>
        MS.core.rel.eq([
          MS.struct.atomProperty.macromolecular.auth_asym_id(),
          c,
        ])
      )
    );
  }

  if (!include) {
    test = MS.core.logic.not([test]);
  }

  return MS.struct.generator.atomGroups({ "chain-test": test });
}

/** Build an Expression selecting residues in a range on a specific chain */
function residueRangeExpression(chain: string, start: number, end: number): Expression {
  return MS.struct.generator.atomGroups({
    "chain-test": MS.core.rel.eq([
      MS.struct.atomProperty.macromolecular.auth_asym_id(),
      chain,
    ]),
    "residue-test": MS.core.logic.and([
      MS.core.rel.gre([
        MS.struct.atomProperty.macromolecular.auth_seq_id(),
        start,
      ]),
      MS.core.rel.lte([
        MS.struct.atomProperty.macromolecular.auth_seq_id(),
        end,
      ]),
    ]),
  });
}

/** Convert hex color string to Molstar Color number */
function hexToMolstarColor(hex: string): Color {
  const clean = hex.replace("#", "");
  return Color(parseInt(clean, 16));
}

export interface ClickedResidue {
  chainId: string;
  seqId: number;
  compId: string;
}

export function useMolstarPlugin({ containerRef, pdbId, pdbData, highlightedChain, highlightRegions }: UseMolstarPluginOptions) {
  const pluginRef = useRef<PluginContext | null>(null);
  const [pluginReady, setPluginReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [clickedResidue, setClickedResidue] = useState<ClickedResidue | null>(null);

  // Initialize plugin once when container is available
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let hoverSub: { unsubscribe: () => void } | null = null;
    let clickSub: { unsubscribe: () => void } | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const plugin = new PluginContext(DefaultPluginSpec());

    async function init() {
      try {
        await plugin.init();
        if (disposed) { plugin.dispose(); return; }

        // Create canvas element inside the container
        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        container!.appendChild(canvas);

        await plugin.initViewerAsync(canvas, container!);

        // Dark background
        plugin.canvas3d?.setProps({
          renderer: {
            backgroundColor: ColorNames.black,
          },
        });

        // Set interactivity to residue-level for educational hover info
        plugin.managers.interactivity.setProps({ granularity: "residue" });

        pluginRef.current = plugin;
        setPluginReady(true);

        // Watch container for size changes so the canvas stays in sync
        resizeObserver = new ResizeObserver(() => {
          plugin.handleResize();
        });
        resizeObserver.observe(container!);

        // Subscribe to hover labels for tooltip display
        hoverSub = plugin.behaviors.labels.highlight.subscribe((e) => {
          if (e.labels.length > 0) {
            const text = e.labels.map((l) => typeof l === "string" ? l : String(l)).join(", ");
            setHoverLabel(text);
          } else {
            setHoverLabel(null);
          }
        });

        // Subscribe to click events for residue selection
        clickSub = plugin.behaviors.interaction.click.subscribe((event) => {
          const loci = Loci.normalize(event.current.loci, "residue");
          if (!StructureElement.Loci.is(loci)) return;

          const seen = new Set<string>();
          const residues: ClickedResidue[] = [];
          for (const { unit, indices } of loci.elements) {
            OrderedSet.forEach(indices, (idx) => {
              const loc = StructureElement.Location.create(loci.structure, unit, unit.elements[idx]);
              const chainId = StructureProperties.chain.auth_asym_id(loc);
              const seqId = StructureProperties.residue.auth_seq_id(loc);
              const compId = StructureProperties.residue.label_comp_id(loc);
              const key = `${chainId}${seqId}`;
              if (!seen.has(key)) {
                seen.add(key);
                residues.push({ chainId, seqId, compId });
              }
            });
          }
          if (residues.length > 0) {
            setClickedResidue(residues[0]);
          }
        });
      } catch (e) {
        if (!disposed) {
          setError(e instanceof Error ? e.message : "Failed to initialize viewer");
        }
      }
    }

    init();

    return () => {
      disposed = true;
      setPluginReady(false);
      resizeObserver?.disconnect();
      hoverSub?.unsubscribe();
      clickSub?.unsubscribe();
      plugin.dispose();
      pluginRef.current = null;
      // Clean up canvas
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [containerRef]);

  // Load structure when plugin is ready or pdbId/pdbData/highlightedChain changes
  useEffect(() => {
    const plugin = pluginRef.current;
    if (!plugin || !pluginReady) return;
    if (!pdbId && !pdbData) return;

    let cancelled = false;

    async function loadStructure() {
      setLoading(true);
      setError(null);

      try {
        // Clear existing state
        await plugin!.clear();

        const update = plugin!.build();

        let structureRef;

        if (pdbData) {
          structureRef = update
            .toRoot()
            .apply(RawData, { data: pdbData, label: "Uploaded PDB" })
            .apply(TrajectoryFromPDB)
            .apply(ModelFromTrajectory)
            .apply(StructureFromModel);
        } else if (pdbId) {
          const url = `https://models.rcsb.org/${pdbId.toLowerCase()}.bcif`;
          structureRef = update
            .toRoot()
            .apply(Download, { url, isBinary: true, label: pdbId })
            .apply(ParseCif)
            .apply(TrajectoryFromMmCif)
            .apply(ModelFromTrajectory)
            .apply(StructureFromModel);
        }

        if (structureRef) {
          const activeRegions = highlightRegions?.filter((r) => r.startResidue > 0) ?? [];
          const hasRegionHighlight = activeRegions.length > 0;

          // Parse highlighted chains (e.g., "A" or "A,B")
          const selectedChains = highlightedChain
            ? highlightedChain.split(",").map((c) => c.trim()).filter(Boolean)
            : [];
          const hasChainHighlight = selectedChains.length > 0;

          if (hasRegionHighlight) {
            // Region-based highlighting: base structure is semi-transparent gray,
            // each selected region is colored with its specific color

            // Base polymer — translucent gray
            const base = structureRef.apply(StructureComponent, {
              type: { name: "static" as const, params: "polymer" },
              label: "Structure",
            });

            base.apply(StructureRepresentation3D, {
              type: { name: "cartoon", params: { alpha: 0.25 } },
              colorTheme: { name: "uniform", params: { value: ColorNames.gray } },
            });

            // Each highlighted region — solid color cartoon overlay
            for (const region of activeRegions) {
              const regionComponent = structureRef.apply(StructureComponent, {
                type: {
                  name: "expression" as const,
                  params: residueRangeExpression(region.chain, region.startResidue, region.endResidue),
                },
                label: region.label || `${region.chain}:${region.startResidue}-${region.endResidue}`,
              });

              regionComponent.apply(StructureRepresentation3D, {
                type: { name: "cartoon", params: {} },
                colorTheme: { name: "uniform", params: { value: hexToMolstarColor(region.color) } },
              });
            }
          } else if (hasChainHighlight) {
            // Selected chain(s) — full color cartoon
            const selectedComponent = structureRef.apply(StructureComponent, {
              type: {
                name: "expression" as const,
                params: chainExpression(selectedChains, true),
              },
              label: `Chain ${selectedChains.join(", ")}`,
            });

            selectedComponent.apply(StructureRepresentation3D, {
              type: { name: "cartoon", params: {} },
              colorTheme: { name: "sequence-id", params: {} },
            });

            // Other chains — faded gray cartoon
            const otherComponent = structureRef.apply(StructureComponent, {
              type: {
                name: "expression" as const,
                params: chainExpression(selectedChains, false),
              },
              label: "Other chains",
            });

            otherComponent.apply(StructureRepresentation3D, {
              type: { name: "cartoon", params: {} },
              colorTheme: { name: "uniform", params: { value: ColorNames.lightgray } },
            });
          } else {
            // No highlight — show all polymer normally
            const polymer = structureRef.apply(StructureComponent, {
              type: { name: "static" as const, params: "polymer" },
            });

            polymer.apply(StructureRepresentation3D, {
              type: { name: "cartoon", params: {} },
              colorTheme: { name: "sequence-id", params: {} },
            });
          }

          // Always show ligands
          const ligand = structureRef.apply(StructureComponent, {
            type: { name: "static" as const, params: "ligand" },
          });

          ligand.apply(StructureRepresentation3D, {
            type: { name: "ball-and-stick", params: {} },
            colorTheme: { name: "element-symbol", params: {} },
          });

          await update.commit();

          if (!cancelled) {
            plugin!.canvas3d?.requestCameraReset();
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load structure");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStructure();

    return () => {
      cancelled = true;
    };
  }, [pluginReady, pdbId, pdbData, highlightedChain, highlightRegions]);

  return { plugin: pluginRef.current, loading, error, hoverLabel, clickedResidue };
}
