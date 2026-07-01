import React from "react";
import { useTrial } from "@/lib/TrialContext";
import { daysRemaining } from "@/lib/trialUtils";

export default function TrialBanner() {
  const { isTrialMode, trial } = useTrial();

  if (!isTrialMode || !trial) return null;

  const remaining = daysRemaining(trial.expiresAtMs);

  return (
    <div className="w-full bg-amber-500 text-black px-4 py-2 text-sm font-semibold flex items-center justify-between gap-3">
      <div className="truncate">
        Trial active{remaining != null ? ` • ${remaining} day(s) left` : ""}
      </div>
      <button
        type="button"
        onClick={() => {
          window.location.href = "https://gallero.in/start";
        }}
        className="bg-black text-white px-3 py-1 rounded-md text-xs font-bold"
      >
        Upgrade
      </button>
    </div>
  );
}
