"use client";
// app/stats/page.tsx — Public on-chain analytics page (required for MiniPay submission)

import { useEffect, useState } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { CONTRACT_ADDRESS, PREDICT_ABI } from "@/lib/contract";
import { formatUnits } from "viem";
import Link from "next/link";

interface Stats {
  matchCount: number;
  totalPool: string;
}

export default function StatsPage() {
  const { publicClient } = useMiniPay();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const count = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PREDICT_ABI,
          functionName: "matchCount",
        }) as bigint;

        // Sum pools from all matches
        let totalPool = 0n;
        for (let i = 0; i < Number(count); i++) {
          const result = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: PREDICT_ABI,
            functionName: "getMatch",
            args: [BigInt(i)],
          }) as [string, string, bigint, boolean, boolean, string, bigint, bigint];
          totalPool += result[6]; // totalPool field
        }

        setStats({
          matchCount: Number(count),
          totalPool: formatUnits(totalPool, 18),
        });
      } catch {
        setStats({ matchCount: 0, totalPool: "0" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [publicClient]);

  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="max-w-sm mx-auto">
        <Link href="/" className="text-zinc-400 text-sm block mb-4">← Back</Link>
        <h1 className="text-xl font-bold text-white mb-1">On-Chain Stats</h1>
        <p className="text-xs text-zinc-500 mb-6">
          Live data from{" "}
          <a href={`https://celoscan.io/address/${CONTRACT_ADDRESS}`}
            target="_blank" rel="noopener noreferrer"
            className="text-emerald-400 underline">
            TactiQ contract
          </a>
          {" "}on Celo Mainnet
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-zinc-800 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            <StatCard label="Total Matches Created" value={String(stats?.matchCount ?? 0)} />
            <StatCard label="Total USDm Staked" value={`$${parseFloat(stats?.totalPool ?? "0").toFixed(2)}`} />
            <StatCard label="Contract" value="Celo Mainnet" sub={`${CONTRACT_ADDRESS.slice(0,6)}…${CONTRACT_ADDRESS.slice(-4)}`} />
          </div>
        )}

        <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
          <p className="text-xs text-zinc-500 leading-relaxed">
            All predictions are settled on-chain. Results are public and verifiable on{" "}
            <a href={`https://celoscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
              Celoscan
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}
