"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useMiniPay } from "@/hooks/useMiniPay";
import { fetchMatch, CONTRACT_ADDRESS, type MatchData } from "@/lib/contract";
import { api, FORMATIONS, type Formation } from "@/lib/api";
import StakeButton from "@/components/StakeButton";
import AiTip from "@/components/AiTip";

const TEAM_EMOJI: Record<string, string> = {
  Arsenal: "🔴", Liverpool: "🔴", "Man City": "🔵", Chelsea: "🔵",
  "Real Madrid": "⚪", Barcelona: "🔵", Tottenham: "⚪", "Man United": "🔴",
};

const FORMATION_LABEL: Record<string, string> = {
  "4-3-3": "High Press", "4-4-2": "Classic", "4-2-3-1": "Counter",
  "3-5-2": "Wing Play", "3-4-3": "Total Football", "5-3-2": "Defensive Block",
  "4-1-4-1": "Midfield Wall", "4-5-1": "Park the Bus",
};

// Demo data for pre-deployment
const DEMO_MATCH: MatchData = {
  matchId: 0,
  homeTeam: "Arsenal",
  awayTeam: "Man City",
  kickoffAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  settled: false,
  cancelled: false,
  winningFormation: "",
  totalPool: "127.50",
  totalPoolRaw: 0n,
  predictionCount: 43,
};

const DEMO_POOLS: Record<string, string> = {
  "4-3-3": "52.00", "4-4-2": "18.50", "4-2-3-1": "31.00",
  "3-5-2": "12.00", "3-4-3": "8.00", "5-3-2": "3.50",
  "4-1-4-1": "2.00", "4-5-1": "0.50",
};

export default function PredictPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const router = useRouter();
  const { publicClient, isMiniPay, isLoading: walletLoading, address, balance } = useMiniPay();

  const [match, setMatch] = useState<MatchData | null>(null);
  const [pools, setPools] = useState<Record<string, string>>({});
  const [aiSuggested, setAiSuggested] = useState<Formation[]>([]);
  const [selected, setSelected] = useState<Formation | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function load() {
      const isDeployed = CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
      if (isDeployed) {
        try {
          const m = await fetchMatch(publicClient, Number(matchId));
          setMatch(m);
          // Fetch AI suggestion
          const form = await api.form(m.homeTeam).catch(() => null);
          if (form?.best_formation) setAiSuggested([form.best_formation as Formation]);
          setLoading(false);
          return;
        } catch { /* fall through */ }
      }
      // Demo mode
      setMatch({ ...DEMO_MATCH, matchId: Number(matchId) });
      setPools(DEMO_POOLS as Record<string, string>);
      setAiSuggested(["4-3-3"]);
      setIsDemo(true);
      setLoading(false);
    }
    load();
  }, [matchId, publicClient]);

  if (walletLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="" fill className="rounded-xl object-cover" />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-400/10 border-2 border-emerald-400 flex items-center justify-center mb-5">
          <span className="text-4xl">✓</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Prediction Staked!</h1>
        <p className="text-zinc-400 text-sm mb-1">
          You picked <span className="text-emerald-400 font-bold">{selected}</span>
        </p>
        <p className="text-zinc-500 text-xs mb-8">for {match?.homeTeam} · {FORMATION_LABEL[selected || ""]}</p>
        <p className="text-xs text-zinc-600 mb-6">Good luck — results published after kickoff ⚽</p>
        <a
          href={`https://link.minipay.xyz/receipt?tx=${done}&celebrate`}
          className="w-full bg-emerald-400 text-black font-black py-4 rounded-2xl mb-3 block text-center text-sm"
        >
          View Receipt
        </a>
        <button onClick={() => router.push("/")} className="text-zinc-500 text-sm">
          ← Back to matches
        </button>
      </div>
    );
  }

  if (!match) return null;

  const bal = parseFloat(balance);
  const totalPoolNum = parseFloat(match.totalPool);
  const homeEmoji = TEAM_EMOJI[match.homeTeam] || "⚽";
  const awayEmoji = TEAM_EMOJI[match.awayTeam] || "⚽";

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col max-w-[430px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-zinc-400 text-sm">
          <span>←</span> <span>Matches</span>
        </button>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
          bal < 0.5 ? "bg-amber-400/10 border-amber-400 text-amber-400" : "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
        }`}>
          <span>${bal.toFixed(2)}</span>
          <span className="text-[10px] opacity-70">USDm</span>
        </div>
      </div>

      {/* Match card */}
      <div className="mx-4 mb-4 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4">
        {isDemo && (
          <div className="mb-3 flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/30 rounded-lg px-2 py-1">
            <span className="text-[10px] text-amber-400">⚡ Preview mode</span>
          </div>
        )}

        {/* Teams */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-3xl mb-1.5">{homeEmoji}</span>
            <p className="text-sm font-black text-white text-center">{match.homeTeam}</p>
            <p className="text-[10px] text-zinc-500 font-medium">HOME</p>
          </div>
          <div className="flex flex-col items-center px-3">
            <span className="text-xs font-black text-zinc-700 bg-zinc-800 px-2 py-1 rounded-lg">VS</span>
            <p className="text-[10px] text-zinc-600 mt-1">
              {match.kickoffAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-3xl mb-1.5">{awayEmoji}</span>
            <p className="text-sm font-black text-white text-center">{match.awayTeam}</p>
            <p className="text-[10px] text-zinc-500 font-medium">AWAY</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-zinc-800 bg-zinc-800/50 rounded-xl overflow-hidden">
          <div className="flex flex-col items-center py-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Pool</p>
            <p className="text-sm font-black text-emerald-400">${totalPoolNum.toFixed(0)}</p>
          </div>
          <div className="flex flex-col items-center py-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Players</p>
            <p className="text-sm font-black text-white">{match.predictionCount}</p>
          </div>
          <div className="flex flex-col items-center py-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Min</p>
            <p className="text-sm font-black text-white">$0.50</p>
          </div>
        </div>
      </div>

      {/* AI Tip */}
      <div className="px-4 mb-4">
        <AiTip homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
      </div>

      {/* Formation picker */}
      <div className="px-4 mb-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Predict {match.homeTeam}&apos;s Formation
          </p>
          {selected && (
            <span className="text-xs text-emerald-400 font-bold">{selected} ✓</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FORMATIONS.map((f) => {
            const isAI = aiSuggested.includes(f);
            const isActive = selected === f;
            const pool = pools[f];
            const poolNum = pool ? parseFloat(pool) : 0;
            const pct = totalPoolNum > 0 ? Math.round((poolNum / totalPoolNum) * 100) : 0;

            return (
              <button
                key={f}
                onClick={() => setSelected(f)}
                className={`relative flex flex-col items-start rounded-xl border p-3 text-left transition-all active:scale-95 ${
                  isActive
                    ? "border-emerald-400 bg-emerald-400/10 shadow-[0_0_12px_rgba(52,211,153,0.15)]"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                {isAI && (
                  <span className="absolute top-2 right-2 text-[9px] font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/40 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    AI ✦
                  </span>
                )}
                <span className={`text-sm font-black mb-0.5 ${isActive ? "text-emerald-400" : "text-white"}`}>{f}</span>
                <span className="text-[10px] text-zinc-500">{FORMATION_LABEL[f]}</span>
                {pool && (
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-[9px] text-zinc-600 mb-0.5">
                      <span>${poolNum.toFixed(2)}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isActive ? "bg-emerald-400" : "bg-zinc-600"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stake section */}
      <div className="px-4 pb-8">
        {isMiniPay && !isDemo ? (
          <StakeButton
            matchId={match.matchId}
            formation={selected}
            homeTeam={match.homeTeam}
            onSuccess={(txHash) => setDone(txHash)}
          />
        ) : (
          <div className="mt-3">
            <button
              disabled={!selected}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
                selected
                  ? "bg-emerald-400 text-black"
                  : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              }`}
            >
              {selected ? `Stake on ${selected}` : "Pick a formation first"}
            </button>
            {!isMiniPay && (
              <p className="text-center text-xs text-zinc-600 mt-2">Open in MiniPay to stake</p>
            )}
            {isDemo && (
              <p className="text-center text-xs text-amber-400/70 mt-2">Preview mode — staking disabled</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
