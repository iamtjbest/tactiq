// lib/contract.ts — TacticaPredict contract ABI + interaction helpers

import { parseUnits, encodeFunctionData, formatUnits } from "viem";
import type { WalletClient, PublicClient } from "viem";
import { USDM_ADDRESS, USDM_FEE_CURRENCY } from "@/hooks/useMiniPay";

// ── Replace with your deployed contract address after deployment ──────────────
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
// ─────────────────────────────────────────────────────────────────────────────

export const PREDICT_ABI = [
  // createMatch (owner only)
  {
    name: "createMatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "homeTeam", type: "string" },
      { name: "awayTeam", type: "string" },
      { name: "kickoffAt", type: "uint256" },
    ],
    outputs: [{ name: "matchId", type: "uint256" }],
  },
  // predict (user)
  {
    name: "predict",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "matchId", type: "uint256" },
      { name: "formation", type: "string" },
      { name: "stakeAmt", type: "uint256" },
    ],
    outputs: [],
  },
  // getMatch (view)
  {
    name: "getMatch",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "matchId", type: "uint256" }],
    outputs: [
      { name: "homeTeam",         type: "string" },
      { name: "awayTeam",         type: "string" },
      { name: "kickoffAt",        type: "uint256" },
      { name: "settled",          type: "bool" },
      { name: "cancelled",        type: "bool" },
      { name: "winningFormation", type: "string" },
      { name: "totalPool",        type: "uint256" },
      { name: "predictionCount",  type: "uint256" },
    ],
  },
  // getFormationPool (view)
  {
    name: "getFormationPool",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "matchId",   type: "uint256" },
      { name: "formation", type: "string" },
    ],
    outputs: [{ name: "total", type: "uint256" }],
  },
  // getUserPredictions (view)
  {
    name: "getUserPredictions",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "matchId", type: "uint256" },
      { name: "user",    type: "address" },
    ],
    outputs: [
      { name: "formations", type: "string[]" },
      { name: "stakes",     type: "uint256[]" },
    ],
  },
  // matchCount (view)
  {
    name: "matchCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Events
  {
    name: "PredictionMade",
    type: "event",
    inputs: [
      { name: "matchId",   type: "uint256", indexed: true },
      { name: "user",      type: "address", indexed: true },
      { name: "formation", type: "string",  indexed: false },
      { name: "stake",     type: "uint256", indexed: false },
    ],
  },
  {
    name: "MatchSettled",
    type: "event",
    inputs: [
      { name: "matchId",          type: "uint256", indexed: true },
      { name: "winningFormation", type: "string",  indexed: false },
      { name: "totalPool",        type: "uint256", indexed: false },
      { name: "winnersCount",     type: "uint256", indexed: false },
    ],
  },
] as const;

// ERC-20 ABI fragments we need
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export interface MatchData {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: Date;
  settled: boolean;
  cancelled: boolean;
  winningFormation: string;
  totalPool: string;     // formatted USDm
  totalPoolRaw: bigint;
  predictionCount: number;
}

/** Fetch match data from contract */
export async function fetchMatch(publicClient: PublicClient, matchId: number): Promise<MatchData> {
  const result = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICT_ABI,
    functionName: "getMatch",
    args: [BigInt(matchId)],
  });

  const [homeTeam, awayTeam, kickoffAt, settled, cancelled, winningFormation, totalPool, predictionCount] = result as [
    string, string, bigint, boolean, boolean, string, bigint, bigint
  ];

  return {
    matchId,
    homeTeam,
    awayTeam,
    kickoffAt: new Date(Number(kickoffAt) * 1000),
    settled,
    cancelled,
    winningFormation,
    totalPool: formatUnits(totalPool, 18),
    totalPoolRaw: totalPool,
    predictionCount: Number(predictionCount),
  };
}

/** Fetch all active matches */
export async function fetchAllMatches(publicClient: PublicClient): Promise<MatchData[]> {
  const count = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICT_ABI,
    functionName: "matchCount",
  }) as bigint;

  const ids = Array.from({ length: Number(count) }, (_, i) => i);
  const matches = await Promise.all(ids.map(id => fetchMatch(publicClient, id)));
  // Return only open (not settled, not cancelled, kickoff in future)
  return matches.filter(m => !m.settled && !m.cancelled && m.kickoffAt > new Date());
}

/** Get pool size for a specific formation on a match */
export async function fetchFormationPool(
  publicClient: PublicClient,
  matchId: number,
  formation: string
): Promise<string> {
  const raw = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: PREDICT_ABI,
    functionName: "getFormationPool",
    args: [BigInt(matchId), formation],
  }) as bigint;
  return formatUnits(raw, 18);
}

/** Stake USDm on a formation prediction.
 *  Step 1: approve the contract to spend USDm
 *  Step 2: call predict()
 *  Both txs use USDm as feeCurrency (fee abstraction).
 */
export async function stakeOnFormation(
  walletClient: WalletClient,
  publicClient: PublicClient,
  address: `0x${string}`,
  matchId: number,
  formation: string,
  stakeUsdm: string  // e.g. "1.00"
): Promise<{ approveTx: `0x${string}`; predictTx: `0x${string}` }> {
  const stakeWei = parseUnits(stakeUsdm, 18);

  // Check existing allowance
  const allowance = await publicClient.readContract({
    address: USDM_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address, CONTRACT_ADDRESS],
  }) as bigint;

  let approveTx: `0x${string}` = "0x";

  if (allowance < stakeWei) {
    // Approve with feeCurrency = USDm (legacy tx for MiniPay)
    const approveData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, stakeWei],
    });
    approveTx = await walletClient.sendTransaction({
      account: address,
      to: USDM_ADDRESS,
      data: approveData,
      feeCurrency: USDM_FEE_CURRENCY,
    });
    // Wait for approve to land
    await publicClient.waitForTransactionReceipt({ hash: approveTx });
  }

  // Call predict()
  const predictData = encodeFunctionData({
    abi: PREDICT_ABI,
    functionName: "predict",
    args: [BigInt(matchId), formation, stakeWei],
  });
  const predictTx = await walletClient.sendTransaction({
    account: address,
    to: CONTRACT_ADDRESS,
    data: predictData,
    feeCurrency: USDM_FEE_CURRENCY,
  });

  return { approveTx, predictTx };
}
