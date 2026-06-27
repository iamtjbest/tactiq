"use client";
// components/StakeButton.tsx — Approve + stake USDm on contract

import { useState } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { stakeOnFormation, CONTRACT_ADDRESS } from "@/lib/contract";
import type { Formation } from "@/lib/api";

const STAKE_OPTIONS = ["0.50", "1.00", "2.00", "5.00"] as const;

interface StakeButtonProps {
  matchId: number;
  formation: Formation | null;
  homeTeam: string;
  onSuccess: (txHash: string) => void;
}

export default function StakeButton({ matchId, formation, homeTeam, onSuccess }: StakeButtonProps) {
  const { address, balance, isMiniPay, getWalletClient, publicClient, refreshBalance } = useMiniPay();
  const [stake,  setStake]  = useState("1.00");
  const [status, setStatus] = useState<"idle" | "approving" | "staking" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bal = parseFloat(balance);
  const stakeNum = parseFloat(stake);
  const canStake = !!formation && !!address && bal >= stakeNum && isMiniPay && status === "idle";

  async function handleStake() {
    if (!canStake || !address || !formation) return;

    if (bal < stakeNum) {
      window.location.href = "https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT";
      return;
    }

    const client = getWalletClient();
    if (!client) return;

    try {
      setErrorMsg(null);
      setStatus("approving");
      const { predictTx } = await stakeOnFormation(
        client,
        publicClient,
        address,
        matchId,
        formation,
        stake
      );
      setStatus("done");
      refreshBalance();
      onSuccess(predictTx);
    } catch (err: unknown) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setErrorMsg(msg.includes("allowance") ? "Approval failed — please retry." : msg);
    }
  }

  if (!isMiniPay) {
    return (
      <p className="text-center text-sm text-zinc-500 mt-4">
        Open in MiniPay to stake
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Stake amount selector */}
      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Stake Amount</p>
        <div className="grid grid-cols-4 gap-2">
          {STAKE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setStake(opt)}
              className={[
                "rounded-lg border py-2 text-sm font-bold transition-all",
                stake === opt
                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                  : "border-zinc-700 bg-zinc-800 text-zinc-300",
              ].join(" ")}
            >
              ${opt}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-1 text-right">
          Your balance: <span className="text-zinc-300">${bal.toFixed(2)} USDm</span>
        </p>
      </div>

      {/* Stake button */}
      <button
        onClick={handleStake}
        disabled={!canStake}
        className={[
          "w-full rounded-xl py-4 font-bold text-base transition-all",
          canStake
            ? "bg-emerald-400 text-black hover:bg-emerald-300 active:scale-95"
            : "bg-zinc-700 text-zinc-500 cursor-not-allowed",
        ].join(" ")}
      >
        {status === "approving" && "Approving…"}
        {status === "staking"   && "Staking…"}
        {status === "done"      && "✓ Staked!"}
        {status === "error"     && "Retry"}
        {status === "idle"      && (
          formation
            ? `Stake $${stake} on ${formation}`
            : "Pick a formation first"
        )}
      </button>

      {/* Network fee note */}
      {status === "idle" && (
        <p className="text-center text-xs text-zinc-500">
          Network fee paid automatically in USDm
        </p>
      )}

      {/* Error */}
      {status === "error" && errorMsg && (
        <p className="text-center text-xs text-red-400">{errorMsg}</p>
      )}

      {/* Contract note */}
      <p className="text-center text-xs text-zinc-600">
        Contract on Celo Mainnet ·{" "}
        <a
          href={`https://celoscan.io/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Verified on Celoscan
        </a>
      </p>
    </div>
  );
}
