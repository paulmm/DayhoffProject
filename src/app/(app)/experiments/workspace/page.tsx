"use client";

import { WorkspaceProvider } from "@/hooks/useWorkspaceReducer";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function WorkspacePage() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}
