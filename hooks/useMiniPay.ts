// hooks/useMiniPay.ts
// Auto-connects to MiniPay wallet, exposes address + USDm balance

import { useEffect, useState, useCallback } from "react";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  formatUnits,
} from "viem";
import { celo } from "viem/chains";

// Token addresses (for balanceOf / transfer / approve)
export const USDM_ADDRESS  = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;
export const USDC_ADDRESS  = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as const;
export const USDT_ADDRESS  = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as const;

// feeCurrency adapter addresses (use ONLY in the feeCurrency tx field)
export const USDM_FEE_CURRENCY = USDM_ADDRESS;
export const USDC_FEE_CURRENCY = "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B" as const;
export const USDT_FEE_CURRENCY = "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72" as const;

const BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Stable singleton — created once at module level to prevent infinite re-renders
const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

export function useMiniPay() {
  const [address, setAddress]   = useState<`0x${string}` | null>(null);
  const [balance, setBalance]   = useState<string>("0");
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBalance = useCallback(async (addr: `0x${string}`) => {
    try {
      const raw = await publicClient.readContract({
        address: USDM_ADDRESS,
        abi: BALANCE_ABI,
        functionName: "balanceOf",
        args: [addr],
      });
      setBalance(formatUnits(raw, 18));
    } catch {
      setBalance("0");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function init() {
      if (typeof window === "undefined" || !window.ethereum) {
        setIsLoading(false);
        return;
      }
      const mp = window.ethereum.isMiniPay === true;
      setIsMiniPay(mp);
      if (mp) {
        const client = createWalletClient({
          chain: celo,
          transport: custom(window.ethereum),
        });
        const [addr] = await client.getAddresses();
        setAddress(addr);
        await refreshBalance(addr);
      }
      setIsLoading(false);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getWalletClient = useCallback(() => {
    if (typeof window === "undefined" || !window.ethereum) return null;
    return createWalletClient({ chain: celo, transport: custom(window.ethereum) });
  }, []);

  return { address, balance, isMiniPay, isLoading, refreshBalance: () => address && refreshBalance(address), getWalletClient, publicClient };
}
