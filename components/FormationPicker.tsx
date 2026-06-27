"use client";
// components/FormationPicker.tsx — Pick a formation from AI suggestions

import { FORMATIONS, type Formation } from "@/lib/api";

interface FormationPickerProps {
  selected: Formation | null;
  onSelect: (f: Formation) => void;
  pools?: Record<Formation, string>; // USDm staked per formation
  aiSuggested?: Formation[];          // top picks from AI
}

const FORMATION_LABEL: Record<string, string> = {
  "4-3-3":   "High Press",
  "4-4-2":   "Classic",
  "4-2-3-1": "Counter",
  "3-5-2":   "Wing Overload",
  "3-4-3":   "Total Football",
  "5-3-2":   "Defensive",
  "4-1-4-1": "Midfield Wall",
  "4-5-1":   "Park the Bus",
};

export default function FormationPicker({
  selected,
  onSelect,
  pools = {} as Record<Formation, string>,
  aiSuggested = [],
}: FormationPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {FORMATIONS.map((f) => {
        const isAI     = aiSuggested.includes(f);
        const isActive = selected === f;
        const pool     = pools[f] ? `$${parseFloat(pools[f]).toFixed(2)}` : null;

        return (
          <button
            key={f}
            onClick={() => onSelect(f)}
            className={[
              "relative flex flex-col items-start rounded-xl border p-3 text-left transition-all",
              isActive
                ? "border-emerald-400 bg-emerald-400/10"
                : "border-zinc-700 bg-zinc-800 hover:border-zinc-500",
            ].join(" ")}
          >
            {isAI && (
              <span className="absolute top-2 right-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-1.5 py-0.5 rounded-full">
                AI Pick
              </span>
            )}
            <span className={`text-sm font-bold ${isActive ? "text-emerald-400" : "text-white"}`}>
              {f}
            </span>
            <span className="text-xs text-zinc-400 mt-0.5">{FORMATION_LABEL[f]}</span>
            {pool && (
              <span className="text-xs text-zinc-500 mt-1">{pool} staked</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
