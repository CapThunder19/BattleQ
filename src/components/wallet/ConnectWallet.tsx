"use client";

import React, { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";


export function ConnectWallet() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isConnected && address) {
      // store a short user id like "0x1234...abcd"
      const short = `${address.slice(0, 6)}...${address.slice(-4)}`;
      localStorage.setItem("battleq_user", short);
    } else {
      localStorage.removeItem("battleq_user");
    }
  }, [address, isConnected]);

  return <ConnectButton showBalance={false} chainStatus="icon" />;
}

export default ConnectWallet;
