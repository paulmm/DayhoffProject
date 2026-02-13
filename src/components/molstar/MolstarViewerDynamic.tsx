"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MolstarViewerDynamic = dynamic(() => import("./MolstarViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-[#10111a]">
      <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
    </div>
  ),
});

export default MolstarViewerDynamic;
