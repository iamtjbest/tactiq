"use client";
// app/leaderboard/page.tsx — Top predictors leaderboard with demo data

import Link from "next/link";
import Image from "next/image";

const DEMO_LEADERS = [
  { rank: 1, name: "0x7f3a…4d21", wins: 14, earned: "38.20", streak: 3, flag: "🇳🇬" },
  { rank: 2, name: "0x2b89…a7f0", wins: 11, earned: "27.50", streak: 2, flag: "🇰🇪" },
  { rank: 3, name: "0x9c12…33de", wins: 9,  earned: "21.80", streak: 0, flag: "🇬🇭" },
  { rank: 4, name: "0x4e56…b8cc", wins: 8,  earned: "19.00", streak: 1, flag: "🇿🇦" },
  { rank: 5, name: "0xaa01…f2e8", wins: 7,  earned: "14.50", streak: 0, flag: "🇳🇬" },
  { rank: 6, name: "0x3d77…9012", wins: 6,  earned: "12.00", streak: 2, flag: "🇬🇧" },
  { rank: 7, name: "0xc234…dd99", wins: 5,  earned: "9.80",  streak: 0, flag: "🇫🇷" },
  { rank: 8, name: "0x8f90…5511", wins: 4,  earned: "7.60",  streak: 1, flag: "🇳🇬" },
];

const RANK_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: "bg-yellow-400/10 border-yellow-400/40", text: "text-yellow-400" },
  2: { bg: "bg-zinc-300/10 border-zinc-400/30",     text: "text-zinc-300" },
  3: { bg: "bg-amber-600/10 border-amber-700/30",   text: "text-amber-500" },
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col max-w-[430px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7">
            <Image src="/logo.png" alt="" fill className="rounded-lg object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none">TACTIQ</h1>
            <p className="text-[10px] text-emerald-400 font-bold tracking-widest leading-none">PREDICT</p>
          </div>
        </div>
        <Link href="/" className="text-zinc-400 text-xs">← Matches</Link>
      </div>

      {/* Title */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🏆</span>
          <h2 className="text-lg font-black text-white">Leaderboard</h2>
        </div>
        <p className="text-xs text-zinc-500">Top formation predictors · Season 1</p>
      </div>

      {/* Demo notice */}
      <div className="mx-4 mb-4 flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-xl px-3 py-2">
        <span className="text-amber-400 text-xs">⚡</span>
        <p className="text-xs text-amber-400">Preview data — live rankings after contract deploys</p>
      </div>

      {/* Top 3 podium */}
      <div className="mx-4 mb-4 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-end justify-center gap-3">
          {/* 2nd */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm mb-1">
              {DEMO_LEADERS[1].flag}
            </div>
            <div className="w-full bg-zinc-700/50 border border-zinc-700 rounded-t-xl pt-3 pb-2 flex flex-col items-center"
              style={{ height: "60px" }}>
              <p className="text-[10px] text-zinc-400 font-black">2nd</p>
              <p className="text-xs font-black text-white">{DEMO_LEADERS[1].wins} wins</p>
            </div>
          </div>

          {/* 1st */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-lg mb-1">👑</span>
            <div className="w-12 h-12 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-xl mb-1">
              {DEMO_LEADERS[0].flag}
            </div>
            <div className="w-full bg-yellow-400/10 border border-yellow-400/30 rounded-t-xl pt-3 pb-2 flex flex-col items-center"
              style={{ height: "80px" }}>
              <p className="text-[10px] text-yellow-400 font-black">1st</p>
              <p className="text-sm font-black text-white">{DEMO_LEADERS[0].wins} wins</p>
              <p className="text-[10px] text-emerald-400">${DEMO_LEADERS[0].earned}</p>
            </div>
          </div>

          {/* 3rd */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm mb-1">
              {DEMO_LEADERS[2].flag}
            </div>
            <div className="w-full bg-zinc-800/50 border border-zinc-700 rounded-t-xl pt-3 pb-2 flex flex-col items-center"
              style={{ height: "50px" }}>
              <p className="text-[10px] text-amber-500 font-black">3rd</p>
              <p className="text-xs font-black text-white">{DEMO_LEADERS[2].wins} wins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full ranking list */}
      <div className="px-4 pb-8 space-y-2">
        {DEMO_LEADERS.map((p) => {
          const colors = RANK_COLORS[p.rank];
          return (
            <div key={p.rank}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                colors ? colors.bg : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <span className={`text-sm font-black w-5 text-center ${colors?.text ?? "text-zinc-600"}`}>
                {p.rank}
              </span>
              <span className="text-base">{p.flag}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-white font-mono">{p.name}</p>
                <p className="text-[10px] text-zinc-500">{p.wins} correct predictions</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-emerald-400">${p.earned}</p>
                {p.streak > 0 && (
                  <p className="text-[10px] text-orange-400">🔥 {p.streak}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div className="border-t border-zinc-800 flex items-center justify-around py-2 px-4 mt-auto">
        <Link href="/" className="flex flex-col items-center gap-0.5 py-1 px-3">
          <span className="text-lg">🏠</span>
          <span className="text-[10px] text-zinc-500">Home</span>
        </Link>
        <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 py-1 px-3">
          <span className="text-lg">🏆</span>
          <span className="text-[10px] text-emerald-400 font-bold">Rankings</span>
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
