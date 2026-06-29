"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMiniPay } from "@/hooks/useMiniPay";
import { fetchAllMatches, CONTRACT_ADDRESS, type MatchData } from "@/lib/contract";

// Demo matches shown when contract has no data yet (pre-deployment)
const DEMO_MATCHES: MatchData[] = [
  {
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
  },
  {
    matchId: 1,
    homeTeam: "Liverpool",
    awayTeam: "Chelsea",
    kickoffAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    settled: false,
    cancelled: false,
    winningFormation: "",
    totalPool: "88.00",
    totalPoolRaw: 0n,
    predictionCount: 29,
  },
  {
    matchId: 2,
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    kickoffAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    settled: false,
    cancelled: false,
    winningFormation: "",
    totalPool: "312.00",
    totalPoolRaw: 0n,
    predictionCount: 104,
  },
];

const TEAM_EMOJI: Record<string, string> = {
  Arsenal: "🔴", Liverpool: "🔴", "Man City": "🔵", Chelsea: "🔵",
  "Real Madrid": "⚪", Barcelona: "🔵", Tottenham: "⚪", "Man United": "🔴",
};

function getKickoffLabel(date: Date): { label: string; urgent: boolean } {
  const diff = date.getTime() - Date.now();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 2) return { label: "Starting soon", urgent: true };
  if (hours < 24) return { label: `${Math.floor(hours)}h away`, urgent: false };
  const days = Math.floor(hours / 24);
  return { label: `${days}d away`, urgent: false };
}

export default function Home() {
  const { publicClient, isMiniPay, isLoading: walletLoading, address, balance } = useMiniPay();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function load() {
      // Only try contract if it's actually deployed
      const isDeployed = CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
      if (isDeployed) {
        try {
          const m = await fetchAllMatches(publicClient);
          if (m.length > 0) {
            setMatches(m);
            setLoading(false);
            return;
          }
        } catch { /* fall through to demo */ }
      }
      // Show demo data while contract isn't deployed / has no matches
      setMatches(DEMO_MATCHES);
      setIsDemo(true);
      setLoading(false);
    }
    load();
  }, [publicClient]);

  // ── Not in MiniPay ──────────────────────────────────────────────────────────
  if (!walletLoading && !isMiniPay) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        {/* Hero */}
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center pt-12 pb-6">
          <div className="relative w-20 h-20 mb-5">
            <Image src="/logo.png" alt="TactiQ" fill className="rounded-2xl object-cover" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            TactiQ <span className="text-emerald-400">Predict</span>
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mb-8">
            Stake USDm on football formation predictions.<br />
            Free AI tips. Win from the prize pool.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-2 w-full max-w-xs mb-8">
            {[
              { icon: "🤖", text: "Free AI tactical tips by Gemini" },
              { icon: "⚽", text: "Predict formations. Win USDm" },
              { icon: "🌍", text: "Built for MiniPay — Africa first" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm text-zinc-300">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 w-full max-w-xs">
            <p className="text-xs text-zinc-400 text-center mb-1">Open in MiniPay to play</p>
            <p className="text-xs text-zinc-600 text-center">
              Download at{" "}
              <a href="https://minipay.opera.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
                minipay.opera.com
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-800 px-4 py-3">
          <div className="flex justify-center gap-4 text-xs text-zinc-600">
            <Link href="/stats" className="hover:text-zinc-400">Stats</Link>
            <Link href="/terms" className="hover:text-zinc-400">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-400">Privacy</Link>
        <a href="/support" className="flex flex-col items-center gap-0.5 py-1 px-3">Support</a>
          </div>
        </footer>
      </div>
    );
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (walletLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <Image src="/logo.png" alt="" fill className="rounded-xl object-cover opacity-80" />
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main MiniPay App ────────────────────────────────────────────────────────
  const bal = parseFloat(balance);
  const isLow = bal < 0.5;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col max-w-[430px] mx-auto">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="" fill className="rounded-lg object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none">TACTIQ</h1>
            <p className="text-[10px] text-emerald-400 font-bold tracking-widest leading-none">PREDICT</p>
          </div>
        </div>

        {/* Balance chip */}
        <button
          onClick={() => isLow && (window.location.href = "https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
            isLow
              ? "bg-amber-400/10 border-amber-400 text-amber-400"
              : "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
          }`}
        >
          <span>${bal.toFixed(2)}</span>
          <span className="text-[10px] opacity-70">USDm</span>
          {isLow && <span className="text-[10px]">↑ Deposit</span>}
        </button>
      </div>

      {/* Hero banner */}
      <div className="mx-4 mb-4 bg-gradient-to-br from-emerald-950/60 to-zinc-900 border border-emerald-900/40 rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1">Formation Prediction</p>
            <p className="text-white text-sm font-semibold leading-snug max-w-[180px]">
              Pick the formation. Stake USDm. Win from the pool.
            </p>
          </div>
          <span className="text-4xl">⚽</span>
        </div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-emerald-900/40">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Free tip</p>
            <p className="text-xs text-white font-semibold">AI Analysis</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Min stake</p>
            <p className="text-xs text-white font-semibold">$0.50 USDm</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Fee</p>
            <p className="text-xs text-white font-semibold">5%</p>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      {isDemo && (
        <div className="mx-4 mb-3 flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-xl px-3 py-2">
          <span className="text-amber-400 text-xs">⚡</span>
          <p className="text-xs text-amber-400">Preview mode — contract not yet deployed</p>
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between px-4 mb-2">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Open Matches</p>
        <Link href="/leaderboard" className="text-xs text-emerald-400">Leaderboard →</Link>
      </div>

      {/* Match list */}
      <div className="px-4 flex-1 overflow-y-auto pb-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-zinc-800 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((m) => {
              const { label, urgent } = getKickoffLabel(m.kickoffAt);
              const homeEmoji = TEAM_EMOJI[m.homeTeam] || "⚽";
              const awayEmoji = TEAM_EMOJI[m.awayTeam] || "⚽";
              return (
                <Link
                  key={m.matchId}
                  href={isDemo ? "#" : `/predict/${m.matchId}`}
                  className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-4 active:scale-[0.98] transition-transform"
                >
                  {/* Kickoff + urgency */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      urgent
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {urgent ? "🔴 " : ""}{label}
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      {m.kickoffAt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-2xl mb-1">{homeEmoji}</span>
                      <p className="text-xs font-bold text-white text-center leading-tight">{m.homeTeam}</p>
                      <p className="text-[10px] text-zinc-500">Home</p>
                    </div>
                    <div className="flex flex-col items-center px-4">
                      <span className="text-xs font-black text-zinc-600">VS</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-2xl mb-1">{awayEmoji}</span>
                      <p className="text-xs font-bold text-white text-center leading-tight">{m.awayTeam}</p>
                      <p className="text-[10px] text-zinc-500">Away</p>
                    </div>
                  </div>

                  {/* Pool + CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Prize Pool</p>
                      <p className="text-sm font-black text-emerald-400">${parseFloat(m.totalPool).toFixed(0)} USDm</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Predictors</p>
                      <p className="text-sm font-bold text-white">{m.predictionCount}</p>
                    </div>
                    <span className="bg-emerald-400 text-black text-xs font-black px-4 py-2 rounded-full">
                      Predict →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-zinc-800 flex items-center justify-around py-2 px-4">
        <Link href="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
          <span className="text-lg">🏠</span>
          <span className="text-[10px] text-emerald-400 font-bold">Home</span>
        </Link>
        <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 py-1 px-3">
          <span className="text-lg">🏆</span>
          <span className="text-[10px] text-zinc-500">Rankings</span>
        </Link>
        <Link href="/stats" className="flex flex-col items-center gap-0.5 py-1 px-3">
          <span className="text-lg">📊</span>
          <span className="text-[10px] text-zinc-500">Stats</span>
        </Link>
        <a href="/support" className="flex flex-col items-center gap-0.5 py-1 px-3">
          <span className="text-lg">💬</span>
          <span className="text-[10px] text-zinc-500">Support</span>
        </a>
      </div>
    </div>
  );
}
