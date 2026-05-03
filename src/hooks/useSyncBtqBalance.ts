"use client";

import { useEffect } from "react";
import { formatEther } from "viem";
import { parseAbi } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { useGameStore } from "@/store/useGameStore";

const BTQ_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
]);

/**
 * Keeps the game store's solo.score in sync with the user's on-chain BTQ balance.
 * Call this hook from any page/component where game score matters.
 */
export function useSyncBtqBalance() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const syncScore = useGameStore((s) => s.syncScore);

  const contractAddressByChain: Record<number, string | undefined> = {
    46630: process.env.NEXT_PUBLIC_BTQ_ADDRESS_ROBINHOOD,
    421614: process.env.NEXT_PUBLIC_BTQ_ADDRESS_ARBITRUM_SEPOLIA,
  };
  const contractAddress =
    contractAddressByChain[chainId] || process.env.NEXT_PUBLIC_BTQ_ADDRESS || "";
  const isSupportedChain = chainId === 46630 || chainId === 421614;

  const { data: balanceRaw } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: BTQ_ABI,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: isConnected && !!contractAddress && !!address && isSupportedChain,
      refetchInterval: 5000,
    },
  });

  useEffect(() => {
    if (balanceRaw !== undefined && balanceRaw !== null) {
      const balance = Number(formatEther(balanceRaw as bigint));
      // Only sync if the on-chain balance is meaningfully different
      syncScore(Math.floor(balance));
    }
  }, [balanceRaw, syncScore]);
}
