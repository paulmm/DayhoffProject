"use client";

import { Shield } from "lucide-react";
import ChoiceCardGroup from "../chat/ChoiceCardGroup";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
} from "@/hooks/useWorkspaceReducer";
import { WORKSPACE_MESSAGES } from "@/data/workspace-messages";
import { SPIKE_HOTSPOT_REGIONS } from "@/data/antibody-hotspots";

const FRAMEWORK_CARDS = [
  {
    id: "igg1",
    icon: Shield,
    title: "IgG1",
    description:
      "Full effector function — ADCC, CDC. Most common therapeutic framework. Long serum half-life.",
    badge: "Recommended",
  },
  {
    id: "igg4",
    icon: Shield,
    title: "IgG4",
    description:
      "Reduced effector function — minimal ADCC/CDC. Used when blocking without immune activation is desired.",
  },
  {
    id: "vhh",
    icon: Shield,
    title: "VHH (Nanobody)",
    description:
      "Single-domain (~15 kDa). Accesses cryptic epitopes. High stability, easy production.",
  },
];

export default function FrameworkStep() {
  const state = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();

  if (state.framework) return null;

  const handleSelect = (id: string) => {
    const fw = id as "igg1" | "igg4" | "vhh";
    dispatch({ type: "SET_FRAMEWORK", framework: fw });

    // User message
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "user",
        text: `I'll go with ${fw.toUpperCase()}.`,
        step: "framework",
      },
    });

    // AI reasoning
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "ai",
        text: WORKSPACE_MESSAGES.frameworkSelected(fw),
        step: "framework",
      },
    });

    dispatch({ type: "COMPLETE_STEP", step: "framework" });

    // Initialize hotspot regions with selected: false
    dispatch({
      type: "SET_HOTSPOT_REGIONS",
      regions: SPIKE_HOTSPOT_REGIONS.map((r) => ({ ...r, selected: false })),
    });

    // Transition to hotspots
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        role: "ai",
        text: WORKSPACE_MESSAGES.hotspotsIntro,
        step: "hotspots",
        component: "hotspot-selection",
      },
    });
    dispatch({ type: "SET_STEP", step: "hotspots" });
  };

  return (
    <ChoiceCardGroup
      cards={FRAMEWORK_CARDS}
      selected={state.framework}
      onSelect={handleSelect}
    />
  );
}
