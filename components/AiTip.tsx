"use client";
// components/AiTip.tsx — Free Gemini tactical tip (no stake needed)

import { useState } from "react";
import { api } from "@/lib/api";

interface AiTipProps {
  homeTeam: string;
  awayTeam: string;
}

export default function AiTip({ homeTeam, awayTeam }: AiTipProps) {
  const [tip, setTip]       = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function fetchTip() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const message = `Give me a short tactical analysis for ${homeTeam} vs ${awayTeam}. What formation should ${homeTeam} use and why? Keep it under 80 words, punchy and direct.`;
      const res = await api.chat(homeTeam, awayTeam, message, []);
      setTip(res.reply);
    } catch {
      setError("Could not load tip — tap to retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-zinc-800 border border-zinc-700 p-4 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Tactical Tip</span>
          <span className="text-xs text-zinc-500 font-normal">· Free</span>
        </div>
        {!tip && !loading && (
          <button
            onClick={fetchTip}
            className="text-xs bg-emerald-400 text-black font-bold px-3 py-1 rounded-full"
          >
            Get Tip
          </button>
        )}
        {loading && (
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {tip && (
        <p className="text-sm text-zinc-200 leading-relaxed">{tip}</p>
      )}
      {error && (
        <button onClick={fetchTip} className="text-sm text-amber-400 underline">
          {error}
        </button>
      )}
      {!tip && !loading && !error && (
        <p className="text-xs text-zinc-500">Powered by Gemini AI — no stablecoin needed</p>
      )}
    </div>
  );
}
