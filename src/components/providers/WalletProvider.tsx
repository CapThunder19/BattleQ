"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { Chain } from "viem";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia, arbitrumSepolia } from "wagmi/chains";

// Optional custom chains can be provided via NEXT_PUBLIC_* env vars.
const robinhoodChainId = Number(process.env.NEXT_PUBLIC_ROBINHOOD_CHAIN_ID || 0) || undefined;
const robinhoodRpc = process.env.NEXT_PUBLIC_ROBINHOOD_RPC || undefined;

const customChains: Chain[] = [];
if (robinhoodChainId && robinhoodRpc) {
  customChains.push({
    id: robinhoodChainId,
    name: "Robinhood Testnet",
    nativeCurrency: { name: "RHT", symbol: "RHT", decimals: 18 },
    rpcUrls: { default: { http: [robinhoodRpc] } },
    blockExplorers: { default: { name: "Explorer", url: process.env.NEXT_PUBLIC_ROBINHOOD_EXPLORER || "https://explorer" } },
    testnet: true,
  });
}

const chains: [Chain, ...Chain[]] = [arbitrumSepolia, sepolia, mainnet, ...customChains];

const queryClient = new QueryClient();

const RainbowKitEnabledContext = React.createContext(false);

export function useRainbowKitEnabled() {
  return React.useContext(RainbowKitEnabledContext);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  const rainbowKitEnabled = Boolean(projectId);

  const wagmiConfig = projectId
    ? getDefaultConfig({
        appName: "BattleQ",
        chains,
        projectId,
        ssr: true,
      })
    : createConfig({
        chains,
        transports: {
          [arbitrumSepolia.id]: http(),
          [sepolia.id]: http(),
          [mainnet.id]: http(),
          ...(robinhoodChainId && robinhoodRpc ? { [robinhoodChainId]: http(robinhoodRpc) } : {}),
        },
        ssr: true,
      });

  return (
    <RainbowKitEnabledContext.Provider value={rainbowKitEnabled}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {rainbowKitEnabled ? <RainbowKitProvider>{children}</RainbowKitProvider> : children}
        </QueryClientProvider>
      </WagmiProvider>
    </RainbowKitEnabledContext.Provider>
  );
}

export default WalletProvider;
