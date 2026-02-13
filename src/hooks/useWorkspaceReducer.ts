"use client";

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import React from "react";

/* ── Types ────────────────────────────────────────────────────── */

export type WorkspaceStep =
  | "pdb"
  | "framework"
  | "hotspots"
  | "config"
  | "pipeline"
  | "results";

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  step: WorkspaceStep;
  component?: string; // identifier for interactive component to render below text
  timestamp: number;
}

export interface HotspotRegion {
  id: string;
  name: string;
  chain: string;
  range: string;
  color: string;
  description: string;
  selected: boolean;
}

export interface WorkspaceState {
  currentStep: WorkspaceStep;
  completedSteps: WorkspaceStep[];
  messages: ChatMessage[];

  // Step 1
  pdbId: string;
  pdbData: string;
  pdbLoaded: boolean;
  availableChains: string[];

  // Step 2
  framework: "igg1" | "igg4" | "vhh" | null;

  // Step 3
  hotspotRegions: HotspotRegion[];

  // Step 4
  candidateCount: number;
  cdrPreference: "standard" | "extended" | "custom" | null;

  // Step 5/6
  launching: boolean;
  experimentId: string | null;

  // UI
  evidencePanelOpen: boolean;
  epitopeModalOpen: boolean;
}

/* ── Actions ──────────────────────────────────────────────────── */

export type WorkspaceAction =
  | { type: "SET_STEP"; step: WorkspaceStep }
  | { type: "COMPLETE_STEP"; step: WorkspaceStep }
  | { type: "ADD_MESSAGE"; message: Omit<ChatMessage, "id" | "timestamp"> & { id?: string } }
  | { type: "UPDATE_MESSAGE"; id: string; text: string }
  | {
      type: "SET_PDB_DATA";
      pdbId: string;
      pdbData: string;
      chains: string[];
    }
  | { type: "SET_FRAMEWORK"; framework: "igg1" | "igg4" | "vhh" }
  | { type: "SET_HOTSPOT_REGIONS"; regions: HotspotRegion[] }
  | { type: "TOGGLE_HOTSPOT"; regionId: string }
  | { type: "ADD_CUSTOM_HOTSPOT"; region: HotspotRegion }
  | { type: "SET_CANDIDATE_COUNT"; count: number }
  | { type: "SET_CDR_PREFERENCE"; preference: "standard" | "extended" | "custom" }
  | { type: "SET_LAUNCHING"; launching: boolean }
  | { type: "SET_EXPERIMENT_ID"; id: string }
  | { type: "TOGGLE_EVIDENCE_PANEL" }
  | { type: "TOGGLE_EPITOPE_MODAL" };

/* ── Initial State ────────────────────────────────────────────── */

export const initialWorkspaceState: WorkspaceState = {
  currentStep: "pdb",
  completedSteps: [],
  messages: [],

  pdbId: "",
  pdbData: "",
  pdbLoaded: false,
  availableChains: [],

  framework: null,

  hotspotRegions: [],

  candidateCount: 200,
  cdrPreference: null,

  launching: false,
  experimentId: null,

  evidencePanelOpen: false,
  epitopeModalOpen: false,
};

/* ── Reducer ──────────────────────────────────────────────────── */

let messageCounter = 0;

export function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction
): WorkspaceState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };

    case "COMPLETE_STEP":
      if (state.completedSteps.includes(action.step)) return state;
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.step],
      };

    case "ADD_MESSAGE": {
      messageCounter += 1;
      const { id: customId, ...rest } = action.message;
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            ...rest,
            id: customId || `msg-${messageCounter}-${Date.now()}`,
            timestamp: Date.now(),
          },
        ],
      };
    }

    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, text: action.text } : m
        ),
      };

    case "SET_PDB_DATA":
      return {
        ...state,
        pdbId: action.pdbId,
        pdbData: action.pdbData,
        pdbLoaded: true,
        availableChains: action.chains,
      };

    case "SET_FRAMEWORK":
      return { ...state, framework: action.framework };

    case "SET_HOTSPOT_REGIONS":
      return { ...state, hotspotRegions: action.regions };

    case "TOGGLE_HOTSPOT":
      return {
        ...state,
        hotspotRegions: state.hotspotRegions.map((r) =>
          r.id === action.regionId ? { ...r, selected: !r.selected } : r
        ),
      };

    case "ADD_CUSTOM_HOTSPOT":
      return {
        ...state,
        hotspotRegions: [...state.hotspotRegions, action.region],
      };

    case "SET_CANDIDATE_COUNT":
      return { ...state, candidateCount: action.count };

    case "SET_CDR_PREFERENCE":
      return { ...state, cdrPreference: action.preference };

    case "SET_LAUNCHING":
      return { ...state, launching: action.launching };

    case "SET_EXPERIMENT_ID":
      return { ...state, experimentId: action.id };

    case "TOGGLE_EVIDENCE_PANEL":
      return { ...state, evidencePanelOpen: !state.evidencePanelOpen };

    case "TOGGLE_EPITOPE_MODAL":
      return { ...state, epitopeModalOpen: !state.epitopeModalOpen };

    default:
      return state;
  }
}

/* ── Context ──────────────────────────────────────────────────── */

const WorkspaceStateContext = createContext<WorkspaceState>(initialWorkspaceState);
const WorkspaceDispatchContext = createContext<Dispatch<WorkspaceAction>>(
  () => {}
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, initialWorkspaceState);
  return React.createElement(
    WorkspaceStateContext.Provider,
    { value: state },
    React.createElement(
      WorkspaceDispatchContext.Provider,
      { value: dispatch },
      children
    )
  );
}

export function useWorkspaceState() {
  return useContext(WorkspaceStateContext);
}

export function useWorkspaceDispatch() {
  return useContext(WorkspaceDispatchContext);
}
