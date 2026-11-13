"use client";

import dynamic from "next/dynamic";
import { Compass, Loader2 } from "lucide-react";

const DTUCampusGame = dynamic(
  () => import("./components/DTUCampusGame"),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[calc(100vh-64px)] min-h-[600px] flex flex-col items-center justify-center bg-paper-page text-ink-primary gap-4 select-none">
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-cobalt animate-spin" strokeWidth={1.5} />
          <Compass size={16} strokeWidth={1.5} className="absolute text-cobalt" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-medium tracking-tight text-ink-primary">
            Initializing 3D Campus Tour...
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Loading Three.js WebGL engine &amp; DTU 164-acre campus assets
          </p>
        </div>
      </div>
    ),
  },
);

export default function CampusGameClient() {
  return (
    <main className="w-full min-h-[calc(100vh-64px)] bg-paper-page">
      <DTUCampusGame />
    </main>
  );
}
