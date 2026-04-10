"use client";

import { Wallet } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function WalletConnectButton() {
  const { address, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : null;

  const handleConnect = () => {
    if (connectors.length === 0) return;
    const connector = connectors[0];
    connect({ connector });
  };

  const buttonBase = "relative flex items-center gap-3 px-6 py-2.5 transition-all duration-300 font-mono text-[11px] font-black uppercase tracking-[0.2em] group overflow-hidden active:scale-95 disabled:opacity-50";

  if (address) {
    return (
      <button
        onClick={() => disconnect()}
        className={`${buttonBase} border-2 border-white/10 text-white/70 hover:text-white hover:border-white/30`}
        style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 75%, 88% 100%, 0 100%, 0 25%)' }}
      >
        <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
        <Wallet className="w-4 h-4 text-primary relative z-10 transition-transform group-hover:scale-110" />
        <span className="relative z-10">{shortAddress}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={`${buttonBase} border-2 border-primary text-primary shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:shadow-[0_0_25px_rgba(0,242,255,0.4)]`}
      style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 75%, 88% 100%, 0 100%, 0 25%)' }}
    >
      <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
      <Wallet className="w-4 h-4 relative z-10 transition-transform group-hover:scale-110" />
      <span className="relative z-10">{isConnecting ? "CONNECTING..." : "CONNECT_WALLET"}</span>
      
      {/* Glow highlight */}
      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-[100%]" />
    </button>
  );
}
