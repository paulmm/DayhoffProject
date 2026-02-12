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
import { ColorNames } from "molstar/lib/mol-util/color/names";

interface UseMolstarPluginOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  pdbId?: string;
  pdbData?: string;
}

export function useMolstarPlugin({ containerRef, pdbId, pdbData }: UseMolstarPluginOptions) {
  const pluginRef = useRef<PluginContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize plugin once when container is available
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
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

        pluginRef.current = plugin;
      } catch (e) {
        if (!disposed) {
          setError(e instanceof Error ? e.message : "Failed to initialize viewer");
        }
      }
    }

    init();

    return () => {
      disposed = true;
      plugin.dispose();
      pluginRef.current = null;
      // Clean up canvas
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [containerRef]);

  // Load structure when pdbId or pdbData changes
  useEffect(() => {
    const plugin = pluginRef.current;
    if (!plugin) return;
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
          // Load from raw PDB text
          structureRef = update
            .toRoot()
            .apply(RawData, { data: pdbData, label: "Uploaded PDB" })
            .apply(TrajectoryFromPDB)
            .apply(ModelFromTrajectory)
            .apply(StructureFromModel);
        } else if (pdbId) {
          // Load from RCSB (bcif format for efficiency)
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
          // Add cartoon representation for polymer
          const polymer = structureRef.apply(StructureComponent, {
            type: { name: "static" as const, params: "polymer" },
          });

          polymer.apply(StructureRepresentation3D, {
            type: { name: "cartoon", params: {} },
            colorTheme: { name: "sequence-id", params: {} },
          });

          // Add ball-and-stick for ligands
          const ligand = structureRef.apply(StructureComponent, {
            type: { name: "static" as const, params: "ligand" },
          });

          ligand.apply(StructureRepresentation3D, {
            type: { name: "ball-and-stick", params: {} },
            colorTheme: { name: "element-symbol", params: {} },
          });

          await update.commit();

          // Auto-focus the camera on the loaded structure
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
  }, [pdbId, pdbData]);

  return { plugin: pluginRef.current, loading, error };
}
