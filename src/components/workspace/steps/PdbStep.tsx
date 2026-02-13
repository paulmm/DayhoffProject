"use client";

import { useState, useRef } from "react";
import { FileText, Upload, Database, Loader2, Search, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChoiceCardGroup from "../chat/ChoiceCardGroup";
import {
  useWorkspaceState,
  useWorkspaceDispatch,
} from "@/hooks/useWorkspaceReducer";
import { parsePdbChains } from "@/lib/pdb-parser";
import { WORKSPACE_MESSAGES } from "@/data/workspace-messages";

const PDB_CARDS = [
  {
    id: "enter-pdb",
    icon: FileText,
    title: "Enter PDB ID",
    description: "Load a structure directly from RCSB PDB",
  },
  {
    id: "upload-file",
    icon: Upload,
    title: "Upload PDB File",
    description: "Upload a local .pdb file from your computer",
  },
  {
    id: "fetch-db",
    icon: Database,
    title: "Fetch from Database",
    description: "Search our internal structure database",
  },
];

type ActiveMode = null | "enter-pdb" | "upload-file" | "fetch-db";

export default function PdbStep() {
  const state = useWorkspaceState();
  const dispatch = useWorkspaceDispatch();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [activeMode, setActiveMode] = useState<ActiveMode>(null);
  const [pdbInput, setPdbInput] = useState("");
  const [dbQuery, setDbQuery] = useState("");
  const [dbResults, setDbResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (state.pdbLoaded) return null;

  const loadPdb = async (statusText: string) => {
    setLoading(true);
    setLoadingText(statusText);

    try {
      const res = await fetch("https://files.rcsb.org/download/6M0J.pdb");
      if (!res.ok) throw new Error("Failed to fetch PDB");
      const pdbText = await res.text();
      const chains = parsePdbChains(pdbText);

      dispatch({
        type: "SET_PDB_DATA",
        pdbId: "6M0J",
        pdbData: pdbText,
        chains,
      });

      const residueSet = new Set<string>();
      for (const line of pdbText.split("\n")) {
        if (line.startsWith("ATOM")) {
          const chainId = line[21];
          const resSeq = line.substring(22, 26).trim();
          residueSet.add(`${chainId}:${resSeq}`);
        }
      }

      dispatch({
        type: "ADD_MESSAGE",
        message: {
          role: "ai",
          text: WORKSPACE_MESSAGES.pdbLoaded(
            "SARS-CoV-2 RBD–ACE2 Complex",
            "6M0J",
            chains.length,
            residueSet.size
          ),
          step: "pdb",
        },
      });

      dispatch({ type: "COMPLETE_STEP", step: "pdb" });

      // Ensure evidence panel is open now that we have data
      if (!state.evidencePanelOpen) {
        dispatch({ type: "TOGGLE_EVIDENCE_PANEL" });
      }

      dispatch({
        type: "ADD_MESSAGE",
        message: {
          role: "ai",
          text: WORKSPACE_MESSAGES.frameworkIntro,
          step: "framework",
          component: "framework-cards",
        },
      });
      dispatch({ type: "SET_STEP", step: "framework" });
    } catch {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          role: "ai",
          text: "I had trouble loading that structure. Please try again.",
          step: "pdb",
        },
      });
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const handleCardSelect = (id: string) => {
    if (loading) return;

    if (id === "upload-file") {
      fileInputRef.current?.click();
      return;
    }

    setActiveMode(id as ActiveMode);
    setDbResults(false);
    setDbQuery("");
    setPdbInput("");
  };

  const handlePdbSubmit = () => {
    if (!pdbInput.trim()) return;
    dispatch({
      type: "ADD_MESSAGE",
      message: { role: "user", text: `Load PDB: ${pdbInput.toUpperCase()}`, step: "pdb" },
    });
    loadPdb(`Fetching ${pdbInput.toUpperCase()} from RCSB...`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({
      type: "ADD_MESSAGE",
      message: { role: "user", text: `Uploaded: ${file.name}`, step: "pdb" },
    });
    loadPdb(`Parsing ${file.name}...`);
    // Reset so the same file can be selected again
    e.target.value = "";
  };

  const handleDbSearch = () => {
    if (!dbQuery.trim()) return;
    setDbResults(true);
  };

  const handleDbSelect = () => {
    dispatch({
      type: "ADD_MESSAGE",
      message: { role: "user", text: `Selected: 6M0J — SARS-CoV-2 RBD–ACE2 Complex`, step: "pdb" },
    });
    loadPdb("Loading 6M0J from internal database...");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin text-dayhoff-purple" />
        {loadingText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdb,.ent,.cif"
        className="hidden"
        onChange={handleFileChange}
      />

      <ChoiceCardGroup
        cards={PDB_CARDS}
        selected={activeMode}
        onSelect={handleCardSelect}
      />

      {/* Inline interactions */}
      <AnimatePresence mode="wait">
        {activeMode === "enter-pdb" && (
          <motion.div
            key="enter-pdb"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <label className="text-xs font-semibold text-gray-400">
                PDB Identifier
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={pdbInput}
                  onChange={(e) => setPdbInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handlePdbSubmit()}
                  placeholder="e.g., 6M0J"
                  maxLength={4}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handlePdbSubmit}
                  disabled={!pdbInput.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-dayhoff-purple px-4 py-2 text-sm font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-30"
                >
                  Load
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-gray-500">
                Enter a 4-character PDB accession code to fetch from the RCSB Protein Data Bank.
              </p>
            </div>
          </motion.div>
        )}

        {activeMode === "fetch-db" && (
          <motion.div
            key="fetch-db"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <label className="text-xs font-semibold text-gray-400">
                Search Structure Database
              </label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={dbQuery}
                    onChange={(e) => setDbQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleDbSearch()}
                    placeholder="Search by name, target, or organism..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:border-dayhoff-purple focus:outline-none"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleDbSearch}
                  disabled={!dbQuery.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-dayhoff-purple px-4 py-2 text-sm font-semibold text-white hover:bg-dayhoff-purple/80 disabled:opacity-30"
                >
                  Search
                </button>
              </div>

              {/* Mock search results */}
              <AnimatePresence>
                {dbResults && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 space-y-2"
                  >
                    <p className="text-[10px] text-gray-500">
                      3 structures found
                    </p>
                    {[
                      {
                        id: "6M0J",
                        name: "SARS-CoV-2 RBD–ACE2 Complex",
                        resolution: "2.45 Å",
                        organism: "SARS-CoV-2",
                        match: true,
                      },
                      {
                        id: "7DK2",
                        name: "Anti-SARS-CoV-2 Antibody–RBD",
                        resolution: "2.55 Å",
                        organism: "SARS-CoV-2",
                        match: false,
                      },
                      {
                        id: "7BNN",
                        name: "CR3022 Fab–RBD Complex",
                        resolution: "3.10 Å",
                        organism: "SARS-CoV-2",
                        match: false,
                      },
                    ].map((result, idx) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        onClick={handleDbSelect}
                        className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all ${
                          result.match
                            ? "border-dayhoff-purple/30 bg-dayhoff-purple/5 hover:border-dayhoff-purple/50"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {result.id}
                            </span>
                            {result.match && (
                              <span className="rounded-full bg-dayhoff-purple/20 px-1.5 py-0.5 text-[9px] font-semibold text-dayhoff-purple">
                                Best match
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            {result.name}
                          </p>
                        </div>
                        <div className="text-right text-[10px] text-gray-500">
                          <div>{result.resolution}</div>
                          <div>{result.organism}</div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
