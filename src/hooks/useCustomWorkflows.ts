"use client";

import { useState, useEffect, useCallback } from "react";

export interface CustomWorkflow {
  id: string;
  name: string;
  description: string;
  modules: {
    id: string;
    moduleId: string;
    name: string;
    category: string;
    position: { x: number; y: number };
    inputs: string[];
    outputs: string[];
    parameters?: Record<string, any>;
  }[];
  connections: {
    id: string;
    from: string;
    to: string;
    fromPort: string;
    toPort: string;
    dataType: string;
    validated?: boolean;
    learningAnnotation?: string;
  }[];
  category?: string;
  tags?: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "dayhoff-customWorkflows";

function readWorkflows(): CustomWorkflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeWorkflows(workflows: CustomWorkflow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function useCustomWorkflows() {
  const [workflows, setWorkflows] = useState<CustomWorkflow[]>([]);

  useEffect(() => {
    setWorkflows(readWorkflows());
  }, []);

  const saveWorkflow = useCallback((workflow: CustomWorkflow) => {
    setWorkflows((prev) => {
      const existing = prev.findIndex((w) => w.id === workflow.id);
      const updated =
        existing >= 0
          ? prev.map((w, i) =>
              i === existing
                ? { ...workflow, updatedAt: new Date().toISOString() }
                : w
            )
          : [
              ...prev,
              {
                ...workflow,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];
      writeWorkflows(updated);
      return updated;
    });
  }, []);

  const deleteWorkflow = useCallback((id: string) => {
    setWorkflows((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      writeWorkflows(updated);
      return updated;
    });
  }, []);

  const getWorkflow = useCallback(
    (id: string) => {
      return workflows.find((w) => w.id === id) ?? null;
    },
    [workflows]
  );

  return { workflows, saveWorkflow, deleteWorkflow, getWorkflow };
}
