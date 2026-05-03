"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultWallets, getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { Chain } from "viem";
import { createConfig, WagmiConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

// Optional custom chains can be provided via NEXT_PUBLIC_* env vars.
const robinhoodChainId = Number(process.env.NEXT_PUBLIC_ROBINHOOD_CHAIN_ID || 0) || undefined;
const robinhoodRpc = process.env.NEXT_PUBLIC_ROBINHOOD_RPC || undefined;

const customChains: Chain[] = [];
if (robinhoodChainId && robinhoodRpc) {
  customChains.push({
    id: robinhoodChainId,
    name: "Robinhood Testnet",
    network: "robinhood-testnet",
    nativeCurrency: { name: "RHT", symbol: "RHT", decimals: 18 },
    rpcUrls: { default: { http: [robinhoodRpc] } },
    blockExplorers: { default: { name: "Explorer", url: process.env.NEXT_PUBLIC_ROBINHOOD_EXPLORER || "https://explorer" } },
    testnet: true,
  });
}

const chains = [sepolia, mainnet, ...customChains];

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Build default RainbowKit + wagmi config (uses WalletConnect project id)
const { wallets } = getDefaultWallets({
  appName: "BattleQ",
  chains,
  projectId,
});

const wagmiConfig = getDefaultConfig({
  appName: "BattleQ",
  chains,
  wallets,
  projectId,
});

const queryClient = new QueryClient();

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default WalletProvider;
