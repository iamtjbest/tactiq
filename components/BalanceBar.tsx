"use client";
// components/BalanceBar.tsx — Shows USDm balance, redirects to Deposit if zero

import { useMiniPay } from "@/hooks/useMiniPay";

export default function BalanceBar() {
  const { balance, isLoading } = useMiniPay();
  const bal = parseFloat(balance);
  const isLow = bal < 0.5;

  function handleDeposit() {
    window.location.href = "https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT";
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400 uppercase tracking-wider">Balance</span>
        <span className={`text-sm font-bold ${isLow ? "text-amber-400" : "text-emerald-400"}`}>
          ${parseFloat(balance).toFixed(2)} USDm
        </span>
      </div>
      {isLow && (
        <button
          onClick={handleDeposit}
          className="text-xs bg-amber-400 text-black font-bold px-3 py-1 rounded-full"
        >
          Deposit
        </button>
      )}
    </div>
  );
}
